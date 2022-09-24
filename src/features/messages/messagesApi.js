import { io } from 'socket.io-client';
import { apiSlice } from '../api/apiSlice';

export const messagesApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getMessages: builder.query({
			query: (id) =>
				// `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
				`/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
			transformResponse: (response, meta, arg) => {
				let totalMessages = meta.response.headers.get('X-Total-Count');
				return {
					messages: response,
					totalMessages,
					conversationId: arg,
				};
			},
			async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
				const socket = io(process.env.REACT_APP_API_URL, {
					reconnectionDelay: 1000,
					reconnection: true,
					reconnectionAttemps: 10,
					transports: ['websocket'],
					agent: false,
					upgrade: false,
					rejectUnauthorized: false,
				});

				try {
					await cacheDataLoaded;
					socket.on('message', ({ message, conversationId }) => {
						updateCachedData((draft) => {
							// eslint-disable-next-line eqeqeq
							if (draft.conversationId == conversationId) {
								draft.messages.push(message);
							}
						});
					});
				} catch (error) {}
				await cacheEntryRemoved;
				socket.close();
			},
		}),

		getMoreMessages: builder.query({
			query: ({ id, page }) =>
				`/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
			async onQueryStarted({ id, page }, { queryFulfilled, dispatch }) {
				try {
					let { data: previousMessages } = await queryFulfilled;
					dispatch(
						apiSlice.util.updateQueryData('getMessages', id, (draft) => {
							draft.messages = [...draft.messages, ...previousMessages];
						})
					);
				} catch (error) {}
			},
		}),
		addMessage: builder.mutation({
			query: (data) => ({
				url: '/messages',
				method: 'POST',
				body: data,
			}),
		}),
	}),
});

export const { useGetMessagesQuery, useAddMessageMutation, useGetMoreMessagesQuery } = messagesApi;
