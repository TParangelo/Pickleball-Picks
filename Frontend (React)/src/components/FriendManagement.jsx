import React, { useState } from 'react';
import { addRemoveFriend, getAllUsers, getFriendsList } from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../css/FriendManagement.css';
import { IoMdRemoveCircle } from 'react-icons/io';
import { MdLeaderboard } from 'react-icons/md';
import { IoAddCircle } from 'react-icons/io5';
import SearchBar from './SearchBar';
import { useAuth } from '../contexts/AuthContext';
import { IoArrowBack } from 'react-icons/io5';

const FriendManagement = ({ setManageFriend }) => {
	const [addedUserIds, setAddedUserIds] = useState([]); // Track added users
	const { user } = useAuth();
	const [search, setSearch] = useState('');
	const queryClient = useQueryClient();
	// Ensure queryFn calls the function to fetch data
	const { data, error, isLoading } = useQuery({
		queryKey: ['getFriendsList'],
		queryFn: getFriendsList, // Ensure getFriendsList is called directly
		staleTime: 1000 * 60 * 5,
		cacheTime: 1000 * 60 * 5,
		
	});

	const {
		data: userList,
		error: searchError,
		isLoading: searchLoading,
	} = useQuery({
		queryKey: ['searchUsers', search], // Unique key for caching
		queryFn: () => getAllUsers(search), // Pass function reference
		enabled: search.length > 3, // Prevents query from running on empty search
		staleTime: 1000 * 60 * 5,
		cacheTime: 1000 * 60 * 5,
	});

	const {
		mutate,
		isLoading: arLoading,
		isError: arIsError,
		error: arError,
		data: arData,
	} = useMutation({
		mutationFn: (friendInput) =>
			addRemoveFriend(friendInput.id, friendInput.friend_id, friendInput.toAdd),
		onSuccess: (arData) => {
			queryClient.invalidateQueries('social_l');
		},
		onError: (arError) => {
			console.error('Submit failed:', arError);
		},
	});

	const handleChange = (search_param) => {
		setSearch(search_param);
	};

	const handleRemove = (remove_id) => {
		console.log('removing: ', remove_id);
		mutate({ id: user.id, friend_id: remove_id, toAdd: -1 });
	};

	const handleAdd = (add_id) => {
		console.log('adding: ', add_id);
		mutate({ id: user.id, friend_id: add_id, toAdd: 1 });

		setAddedUserIds([...addedUserIds, add_id]);
	};

	return (
		<div className="friend-management-container">
			<div className="top-container">

				<div 
					className="icon-button back-to-board-icon"
					onClick={() => setManageFriend(false)}
					data-tooltip="Back to Leaderboard"
				>
					<IoArrowBack />
				</div>
				<SearchBar
					label="Search for Users"
					type="string"
					value={search}
					onChange={(e) => handleChange(e.target.value)}
				/>
				


			</div>

			{/* Show loading state */}
			{isLoading && <div>Loading...</div>}

			{/* Show error state */}
			{error && <div>Error: {error.message}</div>}

			{/* Show friends list if available */}
			{data && !isLoading && !error && (
				<div className="under-search">
					<div className="title-line">
						{search.length === 0 ? 'Friends List' : ''}
					</div>
					<ul className="friends-list">
						{search.length > 3 && !searchLoading && !searchError
							? userList?.user_list
									.filter((user2) => user2.user_id !== user.id)
									.map(
										(
											user2 // Show search results
										) => (
											<li className="friends-list-item" key={user2.user_id}>
												<div>{user2.user_username}</div>
												{!addedUserIds.includes(user2.user_id) && (
													<IoAddCircle
														onClick={() => handleAdd(user2.user_id)}
														style={{
															width: '1.5rem',
															height: '1.5rem',
															paddingRight: 20,
															cursor: 'pointer',
														}}
													/>
												)}
											</li>
										)
									)
							: data.friends_list.map(
									(
										friend // Show friends list when search is blank
									) => (
										<li
											className="friends-list-item"
											key={friend.friend_id}
											id={friend.friend_id}
										>
											<div>{friend.friend_username}</div>
											<IoMdRemoveCircle
												onClick={() => handleRemove(friend.friend_id)}
												style={{
													width: '1.5rem',
													height: '1.5rem',
													paddingRight: 20,
													cursor: 'pointer',
												}}
											/>
										</li>
									)
							  )}
					</ul>
				</div>
			)}
		</div>
	);
};

export default FriendManagement;
