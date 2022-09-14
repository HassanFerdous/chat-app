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
	const dispatch = useDispatch();
	const [totalPages, setTotalPages] = useState(1);
	const { data, isSuccess } = useGetMessagesQuery(id);
	const { messages, totalMessages } = data || {};

	useEffect(() => {
		if (page > 1) {
			dispatch(messagesApi.endpoints.getMoreMessages.initiate({ id: id, page }));
		}
	}, [page, dispatch, id]);

	useEffect(() => {
		if (isSuccess) {
			setTotalPages(Math.ceil(totalMessages / 20));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuccess]);

	//create reverse infinite scroll
	const handleScroll = (e) => {
		let self = e.target;
		let scrollTop = Math.abs(self.scrollTop);
		let scrollBottom = self.scrollHeight - self.scrollTop - self.clientHeight;
		if (scrollBottom - scrollTop * 2 <= 0) {
			if (page >= totalPages) return;
			setPage((prevPage) => prevPage + 1);
		}
	};

	return (
		<div
			className='relative w-full  p-6  h-[calc(92vh_-_129px)] overflow-y-auto flex flex-col-reverse'
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
