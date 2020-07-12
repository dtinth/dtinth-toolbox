module.exports = function useLocalStorage(key, defaultValue) {
  const value = Vue.ref(localStorage.getItem(key) ?? defaultValue)
  Vue.watch(value, (newValue) => {
    localStorage.setItem(key, newValue)
  })
  return value
}
