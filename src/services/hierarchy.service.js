import ajax from './ajax';

// export const getHierarchy = ajax.get('/api/hierarchies');

// eslint-disable-next-line
export const addHierarchy = (parentId, name, type) => ajax.post('/api/hierarchies', { name, parentId, type });

export const updateHierarchyName = (id, name) => ajax.put(`/api/hierarchies/${id}`, { name });

export const deleteHierarchy = id => ajax.delete(`/api/hierarchies/${id}`);
