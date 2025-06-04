// src/data/mockData.js
// ไฟล์รวมข้อมูลจำลองสำหรับใช้ในแอปพลิเคชัน

// หมวดหมู่สินค้า
export const categories = [
    'ทั้งหมด',
    'อาหารสัตว์',
    'อาบน้ำ ดูแลขน',
    'กรง ที่นอน',
    'ของเล่นสัตว์',
    'ทรายแมว'
  ];
  
  // ชนิดของสัตว์เลี้ยง
  export const animalTypes = [
    'ทั้งหมด',
    'สุนัข',
    'แมว',
    'นก',
    'ปลา',
    'กระต่าย',
    'หนูแฮมสเตอร์'
  ];
  
  // ข้อมูลสินค้า
  export const products = [
    {
      _id: 'prod001',
      name: 'อาหารสุนัข รสเนื้อ',
      description: 'อาหารสุนัขคุณภาพสูง ด้วยเนื้อแท้ 100% เหมาะสำหรับสุนัขทุกสายพันธุ์',
      about: 'อาหารสุนัขสูตรพิเศษ ผลิตจากเนื้อแท้คุณภาพดี อุดมไปด้วยโปรตีนและสารอาหารที่จำเป็นต่อการเจริญเติบโตของสุนัข เหมาะสำหรับสุนัขทุกช่วงวัย ช่วยบำรุงขนให้เงางาม เสริมสร้างกระดูกและฟันให้แข็งแรง เพิ่มภูมิคุ้มกัน และช่วยในระบบย่อยอาหาร',
      category: 'อาหารสัตว์',
      animalType: 'สุนัข',
      status: true,
      isFavorite: true,
      images: ['/images/dog-food-beef.jpg'],
      options: [
        { size: '1 กก.', price: 259, stock: 50 },
        { size: '5 กก.', price: 1190, stock: 30 },
        { size: '15 กก.', price: 2990, stock: 10 }
      ],
      updateAt: '2025-03-20T10:30:00.000Z'
    },
    {
      _id: 'prod002',
      name: 'อาหารแมว รสปลาทะเล',
      description: 'อาหารแมวคุณภาพพรีเมียม ทำจากปลาทะเลแท้ อุดมไปด้วยโอเมก้า 3',
      about: 'อาหารแมวคุณภาพพรีเมียมที่ผลิตจากปลาทะเลน้ำลึกแท้ อุดมไปด้วยโอเมก้า 3 และสารอาหารที่จำเป็นต่อการเติบโตของแมว มีส่วนผสมของน้ำมันปลา วิตามิน และแร่ธาตุ ช่วยบำรุงขน ผิวหนัง และระบบย่อยอาหาร เหมาะสำหรับแมวทุกสายพันธุ์และทุกช่วงวัย',
      category: 'อาหารสัตว์',
      animalType: 'แมว',
      status: true,
      isFavorite: false,
      images: ['/images/cat-food-fish.jpg'],
      options: [
        { size: '500 ก.', price: 199, stock: 45 },
        { size: '2 กก.', price: 690, stock: 25 }
      ],
      updateAt: '2025-03-18T14:20:00.000Z'
    },
    {
      _id: 'prod003',
      name: 'ของเล่นสุนัข ลูกบอลยาง',
      description: 'ของเล่นสุนัขทำจากยางคุณภาพดี ทนทาน กัดไม่ขาด เหมาะสำหรับการเล่นโยนรับ',
      about: 'ลูกบอลยางคุณภาพสูงสำหรับสุนัข ผลิตจากยางธรรมชาติปลอดสารพิษ ออกแบบให้มีความทนทาน กัดแทะได้โดยไม่แตกง่าย มีผิวสัมผัสที่ช่วยนวดเหงือกและทำความสะอาดฟันของสุนัขไปในตัว เหมาะสำหรับการเล่นโยนรับ และสามารถใส่ขนมหรืออาหารเพื่อกระตุ้นการเล่นได้',
      category: 'ของเล่นสัตว์',
      animalType: 'สุนัข',
      status: true,
      isFavorite: true,
      images: ['/images/dog-toy-ball.jpg'],
      options: [
        { size: 'เล็ก', price: 120, stock: 30 },
        { size: 'กลาง', price: 180, stock: 25 },
        { size: 'ใหญ่', price: 220, stock: 20 }
      ],
      updateAt: '2025-03-15T09:45:00.000Z'
    },
    {
      _id: 'prod004',
      name: 'ของเล่นแมว คฑาขนนก',
      description: 'ของเล่นแมวรูปแบบคฑาติดขนนก กระตุ้นสัญชาตญาณการล่าของแมว',
      about: 'คฑาขนนกสำหรับแมว ออกแบบพิเศษเพื่อกระตุ้นสัญชาตญาณการล่าและการเล่นของแมว มีด้ามจับที่ยาวพอเหมาะ ทำให้เจ้าของสามารถเล่นกับแมวได้โดยไม่ต้องเอื้อมมือมากเกินไป ขนนกมีสีสันสดใส เคลื่อนไหวได้อย่างเป็นธรรมชาติเมื่อโบก ช่วยเพิ่มความสนุกและการออกกำลังกายให้กับแมว',
      category: 'ของเล่นสัตว์',
      animalType: 'แมว',
      status: true,
      isFavorite: true,
      images: ['/images/cat-toy-feather.jpg'],
      options: [
        { size: 'มาตรฐาน', price: 150, stock: 40 }
      ],
      updateAt: '2025-03-12T16:30:00.000Z'
    },
    {
      _id: 'prod005',
      name: 'แชมพูสุนัข สูตรอ่อนโยน',
      description: 'แชมพูสุนัขสูตรอ่อนโยน ไม่ระคายเคืองผิว เหมาะสำหรับสุนัขผิวแพ้ง่าย',
      about: 'แชมพูสุนัขสูตรอ่อนโยนพิเศษ ผลิตจากส่วนผสมธรรมชาติ ปราศจากสารเคมีที่อาจก่อให้เกิดการระคายเคือง เช่น SLS, พาราเบน, และสี เหมาะอย่างยิ่งสำหรับสุนัขที่มีผิวบอบบางหรือแพ้ง่าย มี pH ที่สมดุลกับผิวสุนัข ช่วยบำรุงผิวหนังและขน ทำให้ขนนุ่มเป็นเงางาม และมีกลิ่นหอมสดชื่น',
      category: 'อาบน้ำ ดูแลขน',
      animalType: 'สุนัข',
      status: true,
      isFavorite: false,
      images: ['/images/dog-shampoo.jpg'],
      options: [
        { size: '250 มล.', price: 220, stock: 35 },
        { size: '500 มล.', price: 390, stock: 25 }
      ],
      updateAt: '2025-03-10T11:20:00.000Z'
    },
    {
      _id: 'prod006',
      name: 'อาหารปลา เกล็ดผสม',
      description: 'อาหารปลาคุณภาพดี ผสมวิตามินและแร่ธาตุครบถ้วน ทำให้ปลามีสีสันสดใส',
      about: 'อาหารปลาคุณภาพสูงในรูปแบบเกล็ด ผสมวิตามินและแร่ธาตุที่จำเป็นครบถ้วน มีโปรตีนคุณภาพสูงที่ช่วยในการเจริญเติบโต ผสมสารเสริมพิเศษที่ช่วยเพิ่มความสดใสของสีปลา ช่วยเสริมสร้างระบบภูมิคุ้มกัน และป้องกันโรคต่างๆ เหมาะสำหรับปลาทุกชนิด ละลายน้ำง่าย ไม่ทำให้น้ำขุ่น',
      category: 'อาหารสัตว์',
      animalType: 'ปลา',
      status: true,
      isFavorite: false,
      images: ['/images/fish-food.jpg'],
      options: [
        { size: '100 ก.', price: 85, stock: 60 },
        { size: '250 ก.', price: 180, stock: 40 }
      ],
      updateAt: '2025-03-08T13:40:00.000Z'
    },
    {
      _id: 'prod007',
      name: 'เสื้อสุนัข ลายลูกแมว',
      description: 'เสื้อสุนัขน่ารัก ลายลูกแมว ผลิตจากผ้าคอตตอน 100% ใส่สบาย',
      about: 'เสื้อสุนัขดีไซน์น่ารักลายลูกแมว ผลิตจากผ้าคอตตอนคุณภาพสูง 100% นุ่มสบาย ระบายอากาศได้ดี ไม่ระคายเคืองผิว เหมาะสำหรับใส่ในทุกฤดูกาล มียางยืดตรงขอบคอและขอบแขน ทำให้สวมใส่และถอดออกได้ง่าย มีแถบตีนตุ๊กแกที่ใต้ท้องเพื่อให้สามารถปรับขนาดได้ตามความเหมาะสม สามารถซักด้วยเครื่องซักผ้าและซักมือได้',
      category: 'อาบน้ำ ดูแลขน',
      animalType: 'สุนัข',
      status: true,
      isFavorite: true,
      images: ['/images/dog-cloth.jpg'],
      options: [
        { size: 'S', price: 250, stock: 20 },
        { size: 'M', price: 290, stock: 15 },
        { size: 'L', price: 330, stock: 10 }
      ],
      updateAt: '2025-03-05T10:15:00.000Z'
    },
    {
      _id: 'prod008',
      name: 'วิตามินรวมสำหรับสุนัข',
      description: 'วิตามินรวมบำรุงสุขภาพสุนัข ช่วยเสริมภูมิคุ้มกัน เพิ่มความแข็งแรง',
      about: 'วิตามินรวมสำหรับสุนัขที่มีส่วนผสมของวิตามินและแร่ธาตุจำเป็นครบถ้วน ทั้งวิตามิน A, D, E, B-Complex, แคลเซียม, ฟอสฟอรัส, สังกะสี และซีลีเนียม ช่วยเสริมภูมิคุ้มกัน บำรุงผิวหนังและขน เสริมสร้างกระดูกและฟัน ช่วยในการทำงานของระบบประสาทและกล้ามเนื้อ เพิ่มพลังงานและความกระปรี้กระเปร่า เหมาะสำหรับสุนัขทุกสายพันธุ์และทุกช่วงวัย',
      category: 'อาหารสัตว์',
      animalType: 'สุนัข',
      status: true,
      isFavorite: false,
      images: ['/images/dog-vitamin.jpg'],
      options: [
        { size: '60 เม็ด', price: 450, stock: 30 },
        { size: '120 เม็ด', price: 790, stock: 20 }
      ],
      updateAt: '2025-03-03T09:30:00.000Z'
    },
    {
      _id: 'prod009',
      name: 'กรงนก ทรงกลม',
      description: 'กรงนกทรงกลมคลาสสิค ผลิตจากเหล็กคุณภาพดี แข็งแรงทนทาน',
      about: 'กรงนกทรงกลมคลาสสิคที่ผลิตจากเหล็กคุณภาพสูง ชุบโครเมียมเพื่อป้องกันสนิม มีความแข็งแรงทนทาน ซี่กรงมีระยะห่างที่พอดี ไม่ทำให้นกหลุดออกมาได้ แต่ก็ไม่แคบจนเกินไป มีประตูเปิดปิดที่ใช้งานง่าย มาพร้อมกับจานใส่อาหาร ที่ใส่น้ำ และที่เกาะสำหรับนก เหมาะสำหรับนกขนาดเล็กถึงกลาง',
      category: 'กรง ที่นอน',
      animalType: 'นก',
      status: true,
      isFavorite: true,
      images: ['/images/bird-cage.jpg'],
      options: [
        { size: 'กลาง', price: 890, stock: 15 },
        { size: 'ใหญ่', price: 1290, stock: 10 }
      ],
      updateAt: '2025-03-01T15:00:00.000Z'
    },
    {
      _id: 'prod010',
      name: 'อาหารกระต่าย',
      description: 'อาหารกระต่ายคุณภาพพรีเมียม ผสมหญ้าและธัญพืชหลากชนิด',
      about: 'อาหารกระต่ายคุณภาพพรีเมียมที่ผลิตจากหญ้าและธัญพืชหลากหลายชนิด เช่น หญ้าทิโมธี, อัลฟัลฟา, ข้าวโอ๊ต, ข้าวโพด และถั่ว ผสมผักและผลไม้แห้งที่มีประโยชน์ อุดมไปด้วยเส้นใยที่จำเป็นต่อระบบย่อยอาหาร มีวิตามินและแร่ธาตุครบถ้วน ช่วยบำรุงฟันและกระดูก ลดการเกิดก้อนขนในกระเพาะ ทำให้กระต่ายมีสุขภาพดี ขนเป็นเงางาม',
      category: 'อาหารสัตว์',
      animalType: 'กระต่าย',
      status: true,
      isFavorite: false,
      images: ['/images/rabbit-food.jpg'],
      options: [
        { size: '1 กก.', price: 199, stock: 25 },
        { size: '3 กก.', price: 550, stock: 15 }
      ],
      updateAt: '2025-02-28T11:20:00.000Z'
    },
    {
      _id: 'prod011',
      name: 'ที่นอนแมว ทรงโดม',
      description: 'ที่นอนแมวทรงโดม นุ่มสบาย อบอุ่น เหมาะสำหรับแมวที่ชอบความเป็นส่วนตัว',
      about: 'ที่นอนแมวทรงโดมออกแบบพิเศษสำหรับแมวที่ชอบความเป็นส่วนตัวและพื้นที่ปิดมิดชิด ภายนอกผลิตจากผ้ากำมะหยี่อย่างดี ทนทาน ภายในบุด้วยผ้าขนนุ่มพิเศษที่ให้ความอบอุ่นและสบาย มีฐานกันลื่นเพื่อความปลอดภัย สามารถถอดซักได้ทั้งหมด โครงสร้างสามารถพับเก็บได้เมื่อไม่ใช้งาน ขนาดที่พอดีกับแมวทั่วไป ช่วยให้แมวรู้สึกปลอดภัยและผ่อนคลาย',
      category: 'กรง ที่นอน',
      animalType: 'แมว',
      status: true,
      isFavorite: true,
      images: ['/images/cat-bed.jpg'],
      options: [
        { size: 'มาตรฐาน', price: 690, stock: 20 },
        { size: 'พิเศษ (นุ่มพิเศษ)', price: 990, stock: 10 }
      ],
      updateAt: '2025-02-25T14:30:00.000Z'
    },
    {
      _id: 'prod012',
      name: 'ทรายแมว กลิ่นลาเวนเดอร์',
      description: 'ทรายแมวคุณภาพสูง ดูดซับกลิ่นได้ดีเยี่ยม กลิ่นลาเวนเดอร์หอมสดชื่น',
      about: 'ทรายแมวคุณภาพสูงชนิดจับตัวเป็นก้อน ผลิตจากดินเบนโทไนต์ธรรมชาติ 100% ดูดซับของเสียและกลิ่นได้อย่างรวดเร็วและมีประสิทธิภาพสูง ผสมกลิ่นลาเวนเดอร์ธรรมชาติที่ช่วยลดกลิ่นไม่พึงประสงค์และสร้างบรรยากาศผ่อนคลาย มีฝุ่นน้อย ไม่ติดเท้าแมว และเป็นมิตรกับสิ่งแวดล้อม สามารถย่อยสลายได้ตามธรรมชาติ',
      category: 'ทรายแมว',
      animalType: 'แมว',
      status: true,
      isFavorite: false,
      images: ['/images/cat-litter.jpg'],
      options: [
        { size: '5 ลิตร', price: 189, stock: 30 },
        { size: '10 ลิตร', price: 350, stock: 25 }
      ],
      updateAt: '2025-02-23T09:30:00.000Z'
    }
  ];
  
  // ฟังก์ชัน Mock API สำหรับดึงข้อมูลทั้งหมด
  export const getAllProducts = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...products]);
      }, 800); // จำลองความล่าช้า 0.8 วินาที
    });
  };
  
  // ฟังก์ชัน Mock API สำหรับดึงข้อมูลสินค้าตาม ID
  export const getProductById = (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = products.find(p => p._id === id);
        if (product) {
          resolve({ ...product });
        } else {
          reject(new Error('ไม่พบสินค้า'));
        }
      }, 800);
    });
  };
  
  // ฟังก์ชัน Mock API สำหรับดึงข้อมูลตามหมวดหมู่
  export const getProductsByCategory = (category) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (category === 'ทั้งหมด' || category === 'all') {
          resolve([...products]);
        } else {
          const filteredProducts = products.filter(p => p.category === category);
          resolve([...filteredProducts]);
        }
      }, 800);
    });
  };
  
  // ฟังก์ชัน Mock API สำหรับค้นหาสินค้า
  export const searchProducts = (query, filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...products];
        
        // กรองตามคำค้นหา
        if (query) {
          const searchTerm = query.toLowerCase();
          results = results.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm)
          );
        }
        
        // กรองตามหมวดหมู่
        if (filters.category && filters.category !== 'ทั้งหมด') {
          results = results.filter(product => product.category === filters.category);
        }
        
        // กรองตามชนิดสัตว์
        if (filters.animalType && filters.animalType !== 'ทั้งหมด') {
          results = results.filter(product => product.animalType === filters.animalType);
        }
        
        // กรองตามราคา
        if (filters.price) {
          switch (filters.price) {
            case '฿':
              results = results.filter(product => {
                const minPrice = Math.min(...product.options.map(option => option.price));
                return minPrice < 200;
              });
              break;
            case '฿฿':
              results = results.filter(product => {
                const minPrice = Math.min(...product.options.map(option => option.price));
                return minPrice >= 200 && minPrice < 500;
              });
              break;
            case '฿฿฿':
              results = results.filter(product => {
                const minPrice = Math.min(...product.options.map(option => option.price));
                return minPrice >= 500 && minPrice < 1000;
              });
              break;
            case '฿฿฿฿':
              results = results.filter(product => {
                const minPrice = Math.min(...product.options.map(option => option.price));
                return minPrice >= 1000;
              });
              break;
          }
        }
        
        resolve([...results]);
      }, 800);
    });
  };
  
  // ฟังก์ชัน Mock API สำหรับดึงสินค้าที่ถูกใจ
  export const getFavoriteProducts = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const favoriteProducts = products.filter(product => product.isFavorite);
        resolve([...favoriteProducts]);
      }, 800);
    });
  };
  
  // ฟังก์ชันสำหรับสลับสถานะชื่นชอบ
  export const toggleFavorite = (productId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const productIndex = products.findIndex(p => p._id === productId);
        if (productIndex !== -1) {
          products[productIndex].isFavorite = !products[productIndex].isFavorite;
          resolve({
            success: true,
            product: { ...products[productIndex] }
          });
        } else {
          resolve({
            success: false,
            message: 'ไม่พบสินค้า'
          });
        }
      }, 500);
    });
  };
  
  // ส่งออกฟังก์ชันทั้งหมดเป็น default export สำหรับใช้งานง่าย
  export default {
    categories,
    animalTypes,
    products,
    getAllProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    getFavoriteProducts,
    toggleFavorite
  };