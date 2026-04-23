import {
  crearSalidaPaquetes,
  listarSalidasPaq,
} from '../services/salidasPaq.service';

const salidasPaqController = {
  async getAll(_, payload) {
    try {
      const { data, total } = await listarSalidasPaq(payload || {});
      return { success: true, data, total };
    } catch (error) {
      console.error('Error en salidasPaqController.getAll:', error);
      return { success: false, error: error.message };
    }
  },

  async create(_, payload) {
    try {
      const data = await crearSalidaPaquetes(payload || {});
      return { success: true, data };
    } catch (error) {
      console.error('Error en salidasPaqController.create:', error);
      return { success: false, error: error.message };
    }
  },
};

export default salidasPaqController;
