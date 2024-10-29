// src/admin/components/DataTable.jsx
const DataTable = ({ 
    columns, 
    data, 
    pagination,
    onPageChange,
    loading,
    actions
  }) => {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                {columns.map(column => (
                  <th 
                    key={column.key}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    {column.title}
                  </th>
                ))}
                {actions && <th className="px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id || index} className="border-b">
                    {columns.map(column => (
                      <td key={column.key} className="px-6 py-4 text-sm">
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="px-6 py-4 flex justify-between items-center border-t">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => onPageChange(index + 1)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // src/admin/components/StatsCard.jsx
  const StatsCard = ({ title, value, icon: Icon, trend }) => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <Icon className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            {trend && (
              <p className={`text-sm ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };