import { useState } from 'react';

const ResourceManagement = () => {
  const [resources, setResources] = useState([
    {
      id: 1,
      name: 'First Aid Kits',
      quantity: 50,
      allocated: 30,
      category: 'Medical',
      lastUpdated: '2025-04-01'
    },
    {
      id: 2,
      name: 'T-Shirts',
      quantity: 200,
      allocated: 150,
      category: 'Clothing',
      lastUpdated: '2025-04-02'
    },
    {
      id: 3,
      name: 'Water Bottles',
      quantity: 500,
      allocated: 300,
      category: 'Supplies',
      lastUpdated: '2025-04-03'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    quantity: 0,
    category: ''
  });

  const handleAddResource = (e) => {
    e.preventDefault();
    const resource = {
      id: resources.length + 1,
      ...newResource,
      allocated: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setResources([...resources, resource]);
    setNewResource({ name: '', quantity: 0, category: '' });
    setShowAddForm(false);
  };

  const handleUpdateQuantity = (id, change) => {
    setResources(resources.map(resource => {
      if (resource.id === id) {
        const newQuantity = Math.max(0, resource.quantity + change);
        return {
          ...resource,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return resource;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 px-4 py-2 text-white rounded-md hover:bg-indigo-700"
        >
          Add Resource
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Resource</h2>
          <form onSubmit={handleAddResource} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                value={newResource.quantity}
                onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={newResource.category}
                onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
              >
                Save Resource
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available/Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {resource.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {resource.quantity - resource.allocated}/{resource.quantity}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resource.lastUpdated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(resource.id, 1)}
                      className="text-green-600 hover:text-green-900"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleUpdateQuantity(resource.id, -1)}
                      className="text-red-600 hover:text-red-900"
                    >
                      -
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceManagement;
