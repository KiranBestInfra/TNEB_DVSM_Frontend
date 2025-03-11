import { useDispatch } from 'react-redux'
import { setUser } from '../store/slices/userSlice'

const Login = () => {
  const dispatch = useDispatch()

  const handleLogin = async (credentials) => {
    try {
      const response = await loginAPI(credentials)
      
      // Store user data in Redux
      dispatch(setUser({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name
      }))
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
} 