exports.generateId = async (db, prefix, tableName) => {
  let d = new Date();
  let date = `${d.getDate()}`;
  let m = `${d.getMonth() + 1}`;
  let y = `${d.getFullYear()}`;
  let dmy = `${date.padStart(2, 0)}${m.padStart(2, 0)}${y.substr(-2)}`;

  let masterQuery = await db.sequelize.query(
    `SELECT RIGHT(id,4) as data FROM ${tableName} WHERE id LIKE "${prefix}-${dmy}%" ORDER BY id DESC LIMIT 1`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

  let count = '1';
  let customId;

  if (masterQuery.length > 0) {
    count = `${Number(masterQuery[0].data) + 1}`;
    customId = `${prefix}-${dmy}-${count.padStart(4, '0')}`;
  } else {
    customId = `${prefix}-${dmy}-${count.padStart(4, '0')}`;
  }

  return customId;
};

exports.pagination = (req) => {
  const limitQ = req.query.limit ? { limit: Number(req.query.limit) } : false;
  const page = req.query.page ? { page: Number(req.query.page) > 0 ? Number(req.query.page) : 1 } : false;
  const offsetQ = page ? { offset: (Number(req.query.page) - 1) * Number(req.query.limit) } : false;
  const orderQ = req.query.order ? req.query.order.split(':') : false;

  const order = { order: [orderQ ? [orderQ[0], orderQ[1]] : ['id', 'DESC']] };

  return { ...limitQ, ...offsetQ, ...order };
};

exports.jsonParse = (data) => {
  return JSON.parse(JSON.stringify(data));
};

exports.roundToNearest = (number, multipleOf) => {
  return Math.ceil(number / multipleOf) * multipleOf;
};
