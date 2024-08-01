'use client';

import { useState, FormEvent } from 'react';
import { FaTwitter } from 'react-icons/fa'; // Import the Twitter icon

const Home = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;
      const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`);
      const data = await response.json();

      if (data.deliverability === 'DELIVERABLE') {
        // Call the backend to store the email
        const backendResponse = await fetch('/api/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const backendData = await backendResponse.json();
        setMessage(backendData.message);
      } else {
        setMessage('Email is invalid ❌');
      }
    } catch (error) {
      setMessage('Error validating email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900'>
      <div className='flex flex-col items-center p-8 md:p-12 lg:p-16 mx-auto max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl bg-gray-800 rounded-lg shadow-lg'>
        <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold text-red-500 mb-6 lg:mb-8 italic'>
          Email <span className='text-white'>Validator</span>
        </h1>
        <p className='text-white text-lg md:text-xl lg:text-2xl mb-8 lg:mb-10'>Enter an Email to Validate</p>
        <form onSubmit={handleSubmit} className='w-full flex flex-col items-center'>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='p-4 md:p-5 lg:p-6 mb-6 w-full max-w-sm md:max-w-md lg:max-w-lg text-black rounded-md text-lg md:text-xl lg:text-2xl'
            placeholder='Enter your email'
          />
          <button
            type="submit"
            className='bg-red-500 text-white px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-md hover:bg-red-600 transition duration-300 flex items-center justify-center text-lg md:text-xl lg:text-2xl'
            disabled={loading}
          >
            {loading ? (
              <div className="spinner border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-7 w-7 md:h-9 md:w-9 lg:h-12 lg:w-12"></div>
            ) : (
              'Validate'
            )}
          </button>
        </form>
        {message && <p className='text-white mt-6 text-lg md:text-xl lg:text-2xl'>{message}</p>}
      </div>
      <div className='mt-12 text-center'>
        <p className='text-white text-lg md:text-xl lg:text-2xl'>Feel free to follow :)</p>
        <a
          href='https://x.com/RakshithR20012'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center justify-center text-red-500 text-lg md:text-xl lg:text-2xl hover:underline'
        >
          <FaTwitter className='mr-2 h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white mt-4' /> 
          
        </a>
      </div>
    </main>
  );
};

export default Home;
