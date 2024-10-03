const materials = [
    { id: 1, type: 'pdf', name: 'Введення в трейдинг', url: 'https://example.com/intro.pdf' },
    { id: 2, type: 'video', name: 'Основи технічного аналізу', url: 'https://example.com/tech-analysis.mp4' },
    { id: 3, type: 'pdf', name: 'P2P торгівля для початківців', url: 'https://example.com/p2p-trading.pdf' },
  ];
  
  const getMaterials = () => {
    return materials;
  };
  
  const getMaterialById = (id) => {
    return materials.find(material => material.id === id);
  };
  
  module.exports = {
    getMaterials,
    getMaterialById
  };