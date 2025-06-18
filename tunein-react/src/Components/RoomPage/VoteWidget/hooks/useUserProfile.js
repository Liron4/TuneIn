import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        console.log('useUserProfile: Fetching user profile...');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserProfile({
          username: response.data.nickname,
          profilePicture: response.data.profilePic,
          genres: response.data.genres,
          points: response.data.points
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { userProfile, isLoading };
};