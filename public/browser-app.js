const formDOM = document.querySelector('.form')
const usernameInputDOM = document.querySelector('.username-input')
const passwordInputDOM = document.querySelector('.password-input')
const formAlertDOM = document.querySelector('.form-alert')
const resultDOM = document.querySelector('.result')
const btnDOM = document.querySelector('#data')
const tokenDOM = document.querySelector('.token')

// Store accessToken in memory (not localStorage for security)
let accessToken = null;

// === LOGIN ===
formDOM.addEventListener('submit', async (e) => {
  e.preventDefault()
  formAlertDOM.classList.remove('text-success')
  tokenDOM.classList.remove('text-success')

  const username = usernameInputDOM.value
  const password = passwordInputDOM.value

  try {
    console.log('Attempting login...');
    const { data } = await axios.post(
      '/api/v1/login',
      { username, password },
      { withCredentials: true } // for cookies (refresh token)
    )

    console.log('Login response:', data);
    
    // Store the access token in memory
    accessToken = data.accessToken;
    console.log('Access token set:', accessToken ? 'YES (token exists)' : 'NO (token missing)');

    formAlertDOM.style.display = 'block'
    formAlertDOM.textContent = data.msg
    formAlertDOM.classList.add('text-success')

    usernameInputDOM.value = ''
    passwordInputDOM.value = ''

    tokenDOM.textContent = accessToken ? 'token present' : 'token missing in response';
    tokenDOM.classList.add('text-success')
    resultDOM.innerHTML = ''
  } catch (error) {
    console.error('Login error:', error);
    accessToken = null;
    formAlertDOM.style.display = 'block'
    formAlertDOM.textContent = error.response?.data?.msg || 'Login failed'
    tokenDOM.textContent = 'no token present'
    tokenDOM.classList.remove('text-success')
    resultDOM.innerHTML = ''
  }

  setTimeout(() => {
    formAlertDOM.style.display = 'none'
  }, 2000)
})

// === FETCH PROTECTED DATA ===
btnDOM.addEventListener('click', async () => {
  console.log('Fetching dashboard data with token:', accessToken);
  
  try {
    // Include access token in Authorization header
    const { data } = await axios.get('/api/v1/dashboard', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true, // for refresh token cookie
    })

    console.log('Dashboard data fetched successfully:', data);
    resultDOM.innerHTML = `<h5>${data.msg}</h5><p>${data.secret}</p>`
  } catch (error) {
    console.error('Dashboard fetch error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Attempting token refresh...');
      try {
        // Try refreshing access token
        const refreshRes = await axios.get('/api/v1/refresh', {
          withCredentials: true,
        })
        
        console.log('Refresh response:', refreshRes.data);
        
        // Store the new access token
        accessToken = refreshRes.data.accessToken;
        console.log('New access token set:', accessToken ? 'YES' : 'NO');

        // Retry the original request with new token
        console.log('Retrying dashboard fetch with new token');
        const { data } = await axios.get('/api/v1/dashboard', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        })

        console.log('Dashboard fetch retry successful:', data);
        resultDOM.innerHTML = `<h5>${data.msg}</h5><p>${data.secret}</p>`
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        accessToken = null;
        resultDOM.innerHTML = `<p>Session expired. Please log in again.</p>`
      }
    } else {
      resultDOM.innerHTML = `<p>${error.response?.data?.msg || 'Error'}</p>`
    }
  }
})

// === CHECK TOKEN STATUS ===
const checkToken = () => {
  tokenDOM.classList.remove('text-success')

  console.log('Current token status:', accessToken ? 'present' : 'not present');
  
  if (accessToken) {
    tokenDOM.textContent = 'token present'
    tokenDOM.classList.add('text-success')
  } else {
    tokenDOM.textContent = 'no token present'
  }
}
checkToken()