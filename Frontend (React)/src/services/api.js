import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Adjust this if necessary
const API_BASE_URL2 = "https://picklepicksbackend.onrender.com"; // Adjust this if necessary
const API_LOCAL = "http://localhost:8000";


export const fetchMatches = async () => {
    const response = await fetch(`${API_BASE_URL}/all_matches/`); // Update URL as needed
    if (!response.ok) {
        throw new Error("Failed to fetch matches");
    }
    const data = await response.json();
    return data;
};

export const fetchLeaderboard = async () => {
    const token = localStorage.getItem("token"); // Get the token from localStorage

    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/leaderbaord_both/`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Send the token in the Authorization header
              },
            });
        
            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }
        
            const data = await response.json();
            return data;
          } catch (error) {
            console.error("Error fetching user picks:", error);
            throw error; // Re-throw the error to be handled by the calling function
          }
      }

    const response = await fetch(`${API_BASE_URL}/leaderboard/`); // Update URL as needed
    if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
    }
    const data = await response.json();
    return data;
};

export const fetchLogin = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok){
        throw new Error("Error: Invalid login credentials");
    }
    const data = await response.json();
    return data;
};

export const createAccount = async (email, username, password) => {
    const response = await fetch(`${API_BASE_URL}/add_user/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username, password, email}),
    });
    if (!response.ok){
        const errorData = await response.json(); // Extract error message from response
        throw new Error(errorData.detail || "An error occurred");
    }
    const data = await response.json();
    return data;
};

export const fetchTokenValidity = async () => {
    const token = localStorage.getItem("token"); // Get the token from localStorage

    if (!token) {
        console.error("No token found. Please log in.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/validate-token/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data; // Updated user data
        } else {
            throw new Error("Token is invalid or expired");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        // Optionally log out the user if the token is invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
};

export const submitPicks = async (message, count) => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found. Please log in.");
        return;
    }
    console.log("Submitting picks with message:", message);
        if(count === 1) {
            const response = await fetch(`${API_BASE_URL}/create_straight_pick/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(message),
            });
    
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const errorData = await response.json(); // Extract error message from response
                throw new Error(`${errorData.detail.message}_${errorData.detail.id}` || "An error occurred");
            }
        }
        if (count >= 2)
        {
            const response = await fetch(`${API_BASE_URL}/create_parlay/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(message),
            });
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const errorData = await response.json(); // Extract error message from response
                throw new Error(`${errorData.detail.message}_${errorData.detail.id}` || "An error occurred");
            }
        
        }
}


export const getUserPicks = async () => {
    const token = localStorage.getItem("token"); // Get the token from localStorage

    if (!token) {
        throw new Error("No token found, please log in.");
      }
    
      try {
        const response = await fetch(`${API_BASE_URL}/users_bets/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        });
    
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching user picks:", error);
        throw error; // Re-throw the error to be handled by the calling function
      }
};

export const getFriendsList = async () => {
    const token = localStorage.getItem("token"); // Get the token from localStorage

    if (!token) {
        throw new Error("No token found, please log in.");
      }
      console.log("fetching");
      try {
        const response = await fetch(`${API_BASE_URL}/friends_list/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        });
    
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching user picks:", error);
        throw error; // Re-throw the error to be handled by the calling function
      }
};

export const getAllUsers= async (searchParam) => {
    const response = await fetch(`${API_BASE_URL}/all_users/${searchParam}/`); // Update URL as needed
    if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
    }
    const data = await response.json();
    return data;
};


export const addRemoveFriend = async (user_id, friend_id, toAdd) => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found. Please log in.");
        return;
    }
        if(toAdd === 1) {
            const response = await fetch(`${API_BASE_URL}/add_friend/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({user_id, friend_id}),
            });
    
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const errorData = await response.json(); // Extract error message from response
                throw new Error(errorData.detail || "An error occurred");
            }
        }
        if (toAdd === -1)
        {
            const response = await fetch(`${API_BASE_URL}/remove_friend/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({user_id, friend_id}),
            });
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const errorData = await response.json(); // Extract error message from response
                throw new Error(errorData.detail || "An error occurred");
            }
        }
}

export const requestPasswordReset = async (email) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request password reset');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reset password');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const fetchUserByUsername = async (username) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/${username}/`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || 'Error fetching user data');
    }
};

export const adminLogin = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to login');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const fetchAdminStats = async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats/`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch admin stats');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const startMatch = async (match_id) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/start_match`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ match_id }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to start match');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const setMatchWinner = async ({ match_id, winner }) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/set_winner`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ match_id, winner }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to set match winner');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const deleteMatch = async (matchId) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/delete_match/${matchId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete match');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const fetchAdminUsers = async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to fetch users');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const updateUserBalance = async (userId, newBalance) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/update_balance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ user_id: userId, new_balance: newBalance }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update user balance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const createMatch = async (matchData) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/create_match`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify(matchData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create match');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const fetchAllPlayers = async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }
    try {
        const response = await fetch(`${API_LOCAL}/admin/all_players/`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to fetch users');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const getMatchProbability = async (team1, team2, match_type) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        throw new Error('No admin token found');
    }

    try {
        const response = await fetch(`${API_LOCAL}/admin/match_probability_helper/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ team1, team2, match_type }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get match probability');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};



