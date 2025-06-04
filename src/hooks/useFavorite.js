// useFavorite.js
import { ref } from 'vue';
import favoriteService from '@/services/favoriteService';

export function useFavorite() {
  const favorites = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const fetchFavorites = async () => {
    try {
      isLoading.value = true;
      const response = await favoriteService.getFavoriteItems();
      favorites.value = response.items || [];
    } catch (err) {
      error.value = err;
      favorites.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromFavorite = async (productId) => {
    try {
      await favoriteService.removeFromFavorite(productId);
      await fetchFavorites();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const isInFavorite = (productId) => {
    return favorites.value.some(item => item.productId === productId);
  };

  const addToFavorite = async (productId) => {
    try {
      await favoriteService.addToFavorite(productId);
      await fetchFavorites();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const toggleFavorite = async (productId) => {
    if (isInFavorite(productId)) {
      return await removeFromFavorite(productId);
    } else {
      return await addToFavorite(productId);
    }
  };

  return {
    favorites,
    isLoading,
    error,
    fetchFavorites,
    removeFromFavorite,
    addToFavorite,
    isInFavorite,
    toggleFavorite
  };
}