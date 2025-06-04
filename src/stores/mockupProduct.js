import { ref } from 'vue';

export const products = ref([
    {
        id: 1,
        name: "วิสกัส อาหารแมวชนิดเม็ด",
        Options: [
          { name: "1.2 kg", price: 199 },
          { name: "7 kg", price: 899 },
          { name: "10 kg", price: 1200 },
        ],
        description: "รสปลาแท้ 1.2 kg",
        About: "วิสกัส® เทสตี้มิกซ์ รสทะเลรวมมิตร แครอทในน้ำเกรวี่ อาหารแมวแสนอร่อยที่มอบความสมดุลทางโภชนาการ พร้อมให้คุณค่าสารอาหารที่ลูกแมวต้องการในแต่ละวันครบถ้วน 100% ผลิตจากเนื้อปลา เนื้อไก่ แท้ ๆ 100% และผักที่ได้คุณภาพ อร่อยเพลินกับน้ำเกรวี่เข้มข้นและชุ่มฉ่ำ อุดมด้วยคุณค่าทางสารอาหาร มีดีเอชเอและโอเมก้า 3 สำหรับพัฒนาการสมองและดวงตา อ่านเพิ่มเติม",
        category: "อาหารสัตว์",
        image: "https://tailybuddy.com/products/620/Ocean_Fish.jpg",
        updatedAt: new Date().toLocaleString() ,
        status: 'Active',
      },
      {
        id: 2,
        name: "มีโอ อาหารแมวชนิดเม็ด",
        Options: [
          { name: "1.2 kg", price: 199 },
          { name: "7 kg", price: 899 },
          { name: "10 kg", price: 1200 },
        ],
        description: "รสปลาทู 1.2 kg",
        price: 145,
        category: "อาหารสัตว์",
        image: "https://www.feedmeplease.com/images/pdimg/3674/1.webp",
      },
      {
        id: 3,
        name: "Kasty อาหารแมว",
        Options: [
          { name: "1.2 kg", price: 200 },
          { name: "7 kg", price: 899 },
          { name: "10 kg", price: 1200 },
        ],
        description: "สูตรพิเศษสำหรับแมวโต",
        category: "อาหารสัตว์",
        image: "https://th.bing.com/th/id/R.f7ecb09e2fcd092139fd25c4515312b8?rik=OkQdDP3DcDPQsw&pid=ImgRaw&r=0",
      },
      {
        id: 4,
        name: "ของเล่นแมวสุดน่ารัก",
        Options: [
          { name: "1.2 kg", price: 150 },
          { name: "7 kg", price: 899 },
          { name: "10 kg", price: 1200 },
        ],
        description: "ชุดของเล่นแมวรูปนมกล่อง",
        category: "ของเล่น",
        image: "https://s359.kapook.com/pagebuilder/6a65d056-11bf-455e-8387-d2abdfa0ca11.jpg",
      },
      {
        id: 5,
        name: "แชมพูแมว",
        Options: [
          { name: "1.2 kg", price: 50 },
          { name: "7 kg", price: 899 },
          { name: "10 kg", price: 1200 },
        ],
        description: "แชมพูแมวรูปนมกล่อง",
        category: "ของเล่น",
        image: "https://cf.shopee.co.th/file/6c1ba9611d00aac1e439277fbcf9e5d5"
      }
]);
   