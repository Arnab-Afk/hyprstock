import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Locality() {
    const [locality, setLocality] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleSubmit = async (event) => {
      event.preventDefault();
      const url = 'https://hyprstock.arnabbhowmik019.workers.dev/api/user';
      
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ locality: locality })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Success:', data);
        
        
        const userData = JSON.parse(localStorage.getItem('user'));
        userData.locality = locality;
        localStorage.setItem('user', JSON.stringify(userData));

        // Navigate to home using react-router
        navigate('/dashboard');
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const handleChange = (event) => {
      setLocality(event.target.value);
    };

    return (
      <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Your Company"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              className="mx-auto h-10 w-auto"
            />
          </div>
  
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="locality" className="block text-sm font-medium leading-6 text-gray-900">
                  Please Enter your Locality
                </label>
                <div className="mt-2">
                  <input
                    id="locality"
                    name="locality"
                    type="text"
                    required
                    value={locality}
                    onChange={handleChange}
                    autoComplete="address"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
  
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    )
  }