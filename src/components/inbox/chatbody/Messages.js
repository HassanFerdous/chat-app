import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { messagesApi } from '../../../features/messages/messagesApi';
import Message from './Message';

export default function Messages({ messages = [], conversationId, totalMessages }) {
	const { user } = useSelector((state) => state.auth) || {};
	const { email } = user || {};
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const dispatch = useDispatch();

	const fetchMore = () => {
		setPage((prevPage) => prevPage + 1);
	};

	useEffect(() => {
		if (page > 1) {
			dispatch(messagesApi.endpoints.getMoreMessages.initiate({ id: conversationId, page }));
		}
	}, [page, dispatch, conversationId]);

	useEffect(() => {
		if (totalMessages > 0) {
			const more = Math.ceil(totalMessages / Number(process.env.REACT_APP_CONVERSATIONS_PER_PAGE)) > page;

			setHasMore(more);
		}
	}, [totalMessages, page]);

	return (
		<div className='relative w-full h-[calc(100vh_-_197px)] p-6 overflow-y-auto flex flex-col-reverse'>
			<ul className='space-y-2'>
				{messages
					.slice()
					.sort((a, b) => a.timestamp - b.timestamp)
					.map((message) => {
						const { message: lastMessage, id, sender } = message || {};

						const justify = sender.email !== email ? 'start' : 'end';

						return <Message key={id} justify={justify} message={lastMessage} />;
					})}
			</ul>
		</div>
	);
}
