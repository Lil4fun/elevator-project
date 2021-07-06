<template>
  <div>
    <Logo> </Logo>
    <h1> Login</h1>
    <form>
      <div class="email">
        <label for="mail" class="text"> E-mail address </label>
        <input type="email" id="mail" v-model="user.email" required> 
      </div>
      
      <div class="password">
        <label for="password" class="text"> Password </label>
        <input type="password" id="password" v-model="user.password" required>
      </div>
      
      <input type="submit" @click="userLogin()">

    </form>

    <p> {{message}} </p>
    

  </div>
</template>

<script>


module.exports = {
  
  name: 'Login',
  data () {
    return {
      exampleData: null,
      user:{
        email: "",
        password: "",
      } ,
      message: "", 
      success: ""
    }
  }, 

  methods: {
    
    
   
    
    async userLogin() {
      
      email = this.user.email
      password = this.user.password

      try {    
        const res = await axios.post('api/login/',{email: email, password: password})
        console.log(res.data)  
        this.message = res.data
        this.success = 'success'
     }

      catch(err) {
        console.log(err.response.data.message) 
        this.message = err.response.data.message
      }

      if (this.message == 'Already authentified' || this.success == 'success') {
        setTimeout(function(){router.push('/Footer/');}, 3000 );
      }
    }
  },

  components: { Logo }
}
</script>

  

<style>

h1, p{
  text-align: center;
}

p{
  font-size: 150%;
}

form{
  display: flex;
  flex-direction: column;
  font-size: 150%;  
}

.text{
  text-align-last: left;
}

input{
  
  margin:auto;
  justify-content: right ;
  
}

.email{
  
  margin: auto;
  flex: 1;
}
.password{
 
  margin: auto;
  flex: 1;
  margin-bottom: 0.5%;
}

</style>
