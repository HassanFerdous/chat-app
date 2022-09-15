import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { messagesApi, useGetMessagesQuery } from '../../../features/messages/messagesApi';
import Message from './Message';

export default function Messages({ conversationId: id }) {
	const { user } = useSelector((state) => state.auth) || {};
	const { email } = user || {};
	const [page, setPage] = useState(1);
	const dispatch = useDispatch();
	const [totalPages, setTotalPages] = useState(1);
	const { data, isSuccess } = useGetMessagesQuery(id);
	const { messages, totalMessages } = data || {};
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		if (page > 1) {
			dispatch(messagesApi.endpoints.getMoreMessages.initiate({ id: id, page }));
		}
	}, [page, dispatch, id]);

	useEffect(() => {
		if (isSuccess) {
			setTotalPages(Math.ceil(totalMessages / 20));
		}
	}, [isSuccess, totalMessages]);

	useEffect(() => {
		if (page < totalPages) {
			setHasMore(true);
		} else {
			setHasMore(false);
		}
	}, [page, totalPages]);

	const fetchMore = () => {
		if (page >= totalPages) return;
		setPage((prevPage) => prevPage + 1);
	};

	return (
		<>
			<div
				id='scrollableDiv'
				style={{
					height: '100%',
					overflow: 'auto',
					display: 'flex',
					flexDirection: 'column-reverse',
				}}>
				{/*Put the scroll bar always on the bottom*/}
				<InfiniteScroll
					className='space-y-2 p-6'
					dataLength={messages.length}
					next={fetchMore}
					style={{ display: 'flex', flexDirection: 'column' }} //To put endMessage and loader to the top.
					inverse={true} //
					hasMore={hasMore}
					loader={<h4>Loading...</h4>}
					scrollableTarget='scrollableDiv'>
					{messages
						?.slice()
						.sort((a, b) => a.timestamp - b.timestamp)
						.map((message) => {
							const { message: lastMessage, id, sender } = message || {};

							const justify = sender.email !== email ? 'start' : 'end';
							return <Message key={id} justify={justify} message={lastMessage} />;
						})}
				</InfiniteScroll>
			</div>
		</>
	);
}
