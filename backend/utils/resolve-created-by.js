const User = require("../models/User");
const Admin = require("../models/Admin");
const SuperAdmin = require("../models/SuperAdmin");

const resolveCreatedBy = async (docs) => {
  const isArray = Array.isArray(docs);
  const list = isArray ? docs : [docs].filter(Boolean);

  if (list.length === 0) return isArray ? [] : null;

  const getRawId = (doc) => {
    const val = doc.createdBy;
    if (!val) return null;
    return (val._id || val).toString();
  };

  const ids = [...new Set(list.map(getRawId).filter(Boolean))];

  const [users, admins, superAdmins] = await Promise.all([
    User.find({ _id: { $in: ids } }).select("name username role"),
    Admin.find({ _id: { $in: ids } }).select("name username role"),
    SuperAdmin.find({ _id: { $in: ids } }).select("name username"),
  ]);

  const map = new Map();
  users.forEach((u) =>
    map.set(u._id.toString(), {
      _id: u._id,
      name: u.name,
      username: u.username,
      role: u.role || "USER",
    })
  );
  admins.forEach((a) =>
    map.set(a._id.toString(), {
      _id: a._id,
      name: a.name,
      username: a.username,
      role: a.role || "ADMIN",
    })
  );
  superAdmins.forEach((s) =>
    map.set(s._id.toString(), {
      _id: s._id,
      name: s.name,
      username: s.username,
      role: "SUPER_ADMIN",
    })
  );

  const attach = (doc) => {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    const rawId = getRawId(doc);
    obj.createdBy = rawId ? map.get(rawId) || null : null;
    return obj;
  };

  const result = list.map(attach);
  return isArray ? result : result[0];
};

module.exports = resolveCreatedBy;