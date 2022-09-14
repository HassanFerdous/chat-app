import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { messagesApi, useGetMessagesQuery } from '../../../features/messages/messagesApi';
import Message from './Message';
const debounce = (fn, delay = 300) => {
	let timerId;
	return (...args) => {
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			fn(...args);
		}, delay);
	};
};

export default function Messages({ conversationId: id }) {
	const { user } = useSelector((state) => state.auth) || {};
	const { email } = user || {};
	const [page, setPage] = useState(1);
	const containerRef = useRef(null);
	const [hasMore, setHasMore] = useState(true);
	const dispatch = useDispatch();

	const { data } = useGetMessagesQuery(id);
	const { messages, totalMessages } = data || {};
	console.log(messages);
	useEffect(() => {
		if (page > 1) {
			dispatch(messagesApi.endpoints.getMoreMessages.initiate({ id: id, page }));
		}
	}, [page, dispatch, id]);

	useEffect(() => {
		if (totalMessages > 0) {
			const more = Math.ceil(totalMessages / Number(process.env.REACT_APP_CONVERSATIONS_PER_PAGE)) > page;
			setHasMore(more);
		}
	}, [totalMessages, page]);

	//create reverse infinite scroll
	const handleScroll = (e) => {
		let self = e.target;
		let parentHeight = self.clientHeight + 48;
		let scrollTop = Math.abs(self.scrollTop);

		if (parentHeight - scrollTop <= 0) {
			if (!hasMore) return;
			setPage((prevPage) => prevPage + 1);
		}
	};

	return (
		<div
			className='relative w-full  p-6 pr-0 h-[calc(100vh_-_129px)] overflow-y-auto flex flex-col-reverse'
			onScroll={debounce(handleScroll, 300)}>
			<div className='space-y-2' ref={containerRef}>
				{messages
					?.slice()
					.sort((a, b) => a.timestamp - b.timestamp)
					.map((message) => {
						const { message: lastMessage, id, sender } = message || {};

						const justify = sender.email !== email ? 'start' : 'end';
						return <Message key={id} justify={justify} message={lastMessage} />;
					})}
			</div>
		</div>
	);
}
