import api from './api';

class GroupService {
  async createGroup(name, description, memberIds) {
    const response = await api.post('/chats/group', {
      name,
      description,
      memberIds
    });
    return response.data;
  }
}

export default new GroupService();
