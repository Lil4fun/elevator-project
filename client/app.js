/*
 * Read more on http-vue-loader
 * https://www.npmjs.com/package/http-vue-loader
 */
const App = window.httpVueLoader('./components/Example.vue')
const Navbar = window.httpVueLoader('./components/Navbar.vue')
const ElevatorList = window.httpVueLoader('./components/Elevator.vue')
const Login = window.httpVueLoader('./components/Login.vue')
const Footer = window.httpVueLoader('./components/Footer.vue')
const Logo = window.httpVueLoader('./components/Logo.vue')


// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: Login },
  {path: '/Footer', component: Footer}
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes // short for `routes: routes`
})

// 4. Create and mount the root instance.
// Make sure to inject the router with the router option to make the
// whole app router-aware.
const app = new Vue({
  el: '#app',
  router,

  data: {

  },

  methods: {
    
    },


  components: { Login }
}).$mount('#app')

// Now the app has started!
