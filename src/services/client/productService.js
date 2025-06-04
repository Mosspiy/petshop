import clientRealService from './client/realProductService';
import mockSearchService from './mockSearchService';

const productService = import.meta.env.VITE_USE_MOCK_SERVICE === 'true' 
  ? mockSearchService 
  : clientRealService;

export default productService;