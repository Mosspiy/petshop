<script setup>
  import { Swiper, SwiperSlide } from 'swiper/vue';
  

  import 'swiper/css';
  import 'swiper/css/pagination';
  import 'swiper/css/navigation';
  

  import { Autoplay, Pagination, Navigation } from 'swiper/modules';
  

  import Banner1 from '@/assets/banner/banner1.png';
  import Banner2 from '@/assets/banner/banner2.png';
  import Banner3 from '@/assets/banner/banner3.png';

  // ข้อมูลสไลด์
  const slides = [
    { image: Banner1, link: 'https://page.line.me/640dscku'},
    { image: Banner2, link: 'https://page.line.me/640dscku'},
    { image: Banner3, link: 'https://page.line.me/640dscku'},
  ];
  

  const modules = [Autoplay, Pagination, Navigation];
  </script>


<template>
    <div class="swiper-container">
      <swiper
        :spaceBetween="10"
        :slidesPerView="1"
        :loop="true"
        :autoplay="{
          delay: 2500,
          disableOnInteraction: false
        }"
        :pagination="{
          clickable: true
        }"
        :navigation="false"
        :modules="modules"
        class="mySwiper"
      >
        <swiper-slide v-for="(slide, index) in slides" :key="index">
          <a :href="slide.link" target="_blank" rel="noopener noreferrer">
          <img :src="slide.image" class="w-full h-48 object-cover" :alt="'Slide ' + (index + 1)" />
          </a>
        </swiper-slide>
      </swiper>
    </div>
  </template>
  
  
  
  <style scoped>

  .swiper-container {
    width: 100%;
    max-width: 100%;
  }
  
  /* Swiper styles */
  .mySwiper {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 10px;
  }
  

  
  /* Responsive adjustments */
  
  /* For Mobile (Phone) */
  @media (max-width: 640px) {
    .mySwiper {
      max-width: 100%;
    }
  
    .swiper-container img {
      height: 200px; /* Adjust height for mobile */
    }
  }
  
  /* For Tablets (iPad) */
  @media (min-width: 641px) and (max-width: 1024px) {
    .mySwiper {
      margin-top: 5%;
      max-width: 90%; /* Adjust size for tablets */
    }
  
    .swiper-container img {
      height: 250px; /* Adjust height for tablets */
    }
  }
  
  /* For Larger Screens */
  @media (min-width: 1025px) {
    .mySwiper {
      margin-top: 5%;
      max-width: 80%; /* Adjust size for desktops */
    }
  
    .swiper-container img {
      height: 300px; /* Adjust height for larger screens */
    }
  }
  </style>
  