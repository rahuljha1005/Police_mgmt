const mongoose = require("mongoose");
const { PoliceStation } = require("../models");

const strategicRoles = new Set(["ADMIN", "DGP"]);

const normalizeRole = (user) => user?.role || "";

const getUserStation = async (user) => {
  if (!user?.police_station_id) return null;
  return PoliceStation.findById(user.police_station_id).select("_id name state district zone");
};

const getAccessibleStations = async (user) => {
  const role = normalizeRole(user);

  if (strategicRoles.has(role)) {
    const state = user.state_id || "Maharashtra";
    return PoliceStation.find({ state }).select("_id state district zone");
  }

  if (role === "SP") {
    const station = await getUserStation(user);
    const district = user.district_id || user.assigned_zone_id || user.zone_id || station?.district || station?.zone;
    if (!district) return [];
    return PoliceStation.find({
      $or: [{ district }, { zone: district }],
    }).select("_id state district zone");
  }

  if (role === "INSPECTOR") {
    const stationId = user.police_station_id;
    return stationId ? PoliceStation.find({ _id: stationId }).select("_id state district zone") : [];
  }

  if (role === "CONSTABLE") {
    const stationId = user.police_station_id;
    return stationId ? PoliceStation.find({ _id: stationId }).select("_id state district zone") : [];
  }

  return [];
};

const buildPoliceStationScope = async (user) => {
  const role = normalizeRole(user);
  if (strategicRoles.has(role)) return {};

  const stations = await getAccessibleStations(user);
  const ids = stations.map((station) => station._id);
  if (!ids.length) return { _id: null };

  return { police_station_id: { $in: ids } };
};

const buildFirScope = async (user) => {
  const role = normalizeRole(user);
  const base = await buildPoliceStationScope(user);

  if (role === "CONSTABLE") {
    return {
      ...base,
      assigned_officer_id: new mongoose.Types.ObjectId(user.id || user._id),
    };
  }

  return base;
};

const buildComplaintScope = async (user) => {
  const role = normalizeRole(user);
  const base = await buildPoliceStationScope(user);

  if (role === "CONSTABLE") {
    return {
      ...base,
      assigned_officer_id: new mongoose.Types.ObjectId(user.id || user._id),
    };
  }

  return base;
};

const buildSosScope = async (user) => {
  const role = normalizeRole(user);
  const base = await buildPoliceStationScope(user);

  if (role === "CONSTABLE") {
    return {
      $or: [
        { assigned_officer_id: new mongoose.Types.ObjectId(user.id || user._id) },
        base.police_station_id ? { police_station_id: base.police_station_id, status: { $in: ["PENDING", "ESCALATED"] } } : {},
      ].filter((item) => Object.keys(item).length),
    };
  }

  return base;
};

const getJurisdictionLabel = async (user) => {
  const role = normalizeRole(user);
  if (strategicRoles.has(role)) return { level: "STATE", label: user.state_id || "Maharashtra" };

  const station = await getUserStation(user);
  if (role === "SP") return { level: "DISTRICT", label: user.district_id || user.assigned_zone_id || station?.district || station?.zone || "Assigned District" };
  if (role === "INSPECTOR") return { level: "POLICE_STATION", label: station?.name || "Assigned Station" };
  if (role === "CONSTABLE") return { level: "ASSIGNED_TASKS", label: "Assigned FIRs and emergency tasks" };
  return { level: "UNKNOWN", label: "Restricted" };
};

module.exports = {
  buildComplaintScope,
  buildFirScope,
  buildPoliceStationScope,
  buildSosScope,
  getAccessibleStations,
  getJurisdictionLabel,
  strategicRoles,
};
