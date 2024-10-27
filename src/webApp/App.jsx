import React from 'react';

const App = () => {
  console.log('App component rendering');
  
  return (
    <div className="p-4">
      <div className="bg-blue-100 p-4 rounded-xl">
        <h2 className="text-xl font-bold">Тестовий компонент</h2>
        <p>Якщо ви бачите це, React працює правильно</p>
      </div>
    </div>
  );
};

export default App;