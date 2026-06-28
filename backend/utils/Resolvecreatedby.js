// utils/resolveCreatedBy.js
//
// ROOT-CAUSE FIX for: "selected admin's users' customers are not visible"
// and "selected user's customers are not visible" in the SuperAdmin
// Customers screen.
//
// WHY THIS WAS HAPPENING:
//   - Customer.createdBy is declared with `ref: "User"`.
//   - User.createdBy is ALSO declared with `ref: "User"`.
//   - But in practice:
//       • A User document's createdBy is the ADMIN who created it
//         (stored in the separate Admin collection).
//       • A Customer document's createdBy is sometimes a real User,
//         and sometimes the ADMIN/SUPER_ADMIN who created it directly
//         (when it wasn't assigned to a specific user).
//   - Mongoose's `.populate("createdBy")` only looks inside the single
//     collection named by `ref`. Whenever the id actually belongs to a
//     *different* collection (Admin instead of User), populate can't
//     find a match and silently sets the field to `null`.
//   - The SuperAdmin Customers page filters admins/users/customers on
//     the FRONTEND by comparing `createdBy._id`. Once createdBy is
//     null, that record can never match any admin/user filter, so it
//     just disappears from the filtered list — even though the record
//     is still in the database and was returned by the API.
//
// THE FIX:
//   Resolve `createdBy` manually by checking BOTH the User and Admin
//   (and SuperAdmin) collections for a matching id, instead of relying
//   on Mongoose's single-collection populate. This keeps the existing
//   DB schema/collections untouched (no data migration needed) and
//   just fixes how the API responds.

const User = require("../models/User");
const Admin = require("../models/Admin");
const SuperAdmin = require("../models/SuperAdmin");

/**
 * Resolve the `createdBy` field on one document or an array of documents
 * by looking the id up across User, Admin, and SuperAdmin collections.
 *
 * @param {Array|Object} docs - mongoose document(s) or plain object(s)
 * @returns {Promise<Array|Object>} same shape as input, with createdBy
 *          replaced by { _id, name, username, role } or null
 */
const resolveCreatedBy = async (docs) => {
  const isArray = Array.isArray(docs);
  const list = isArray ? docs : [docs].filter(Boolean);

  if (list.length === 0) return isArray ? [] : null;

  const getRawId = (doc) => {
    const val = doc.createdBy;
    if (!val) return null;
    // already-populated object, or plain ObjectId/string
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