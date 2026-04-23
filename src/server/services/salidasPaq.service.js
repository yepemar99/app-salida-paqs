import { data } from 'react-router-dom';
import database from '../../db/database';

export const listarSalidasPaq = async ({ page = 1, pageSize = 10, fecha }) => {
  try {
    const conn = database.getConnection();
    const safePage = Math.max(Number(page) || 1, 1);
    const safePageSize = Math.max(Number(pageSize) || 10, 1);
    const offset = (safePage - 1) * safePageSize;

    const fechaNormalizada = fecha
      ? String(fecha).slice(0, 10).replace(/'/g, "''")
      : null;
    const whereFecha = fechaNormalizada
      ? `WHERE CAST(sp.creado AS date) = '${fechaNormalizada}'`
      : '';

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT CAST(sp.creado AS date) AS fecha, sp.tubo_id
        FROM Salidas_Paqs_Tubos AS sp
        ${whereFecha}
        GROUP BY CAST(sp.creado AS date), sp.tubo_id
      ) AS grupos
    `;

    const countResult = await conn.query(countQuery);
    const total = countResult[0].total;

    const query = `
      SELECT
        MIN(sp.id) AS id,
        CAST(sp.creado AS date) AS fecha,
        sp.tubo_id,
        MAX(t.medida) AS medida,
        MAX(LTRIM(RTRIM(CONCAT(o.nombre, ' ', o.apellido1, ' ', o.apellido2)))) AS nombre_operario,
        SUM(sp.num_paqs) AS total_num_paqs,
        COUNT(*) AS total_registros
      FROM Salidas_Paqs_Tubos AS sp
      LEFT JOIN Tubos AS t ON t.id = sp.tubo_id
      LEFT JOIN Operarios AS o ON o.id = sp.operario_id
      ${whereFecha}
      GROUP BY CAST(sp.creado AS date), sp.tubo_id
      ORDER BY fecha ASC, sp.tubo_id ASC
      OFFSET ${offset} ROWS FETCH NEXT ${safePageSize} ROWS ONLY
    `;

    const rows = await conn.query(query);
    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        fecha: row.fecha,
        tubo_id: Number(row.tubo_id),
        medida: row.medida,
        nombre_operario: row.nombre_operario,
        total_num_paqs: Number(row.total_num_paqs),
        total_registros: Number(row.total_registros),
      })),
      total,
    };
  } catch (error) {
    console.error('Error al listar salidas_paq:', error);
    throw error;
  }
};
