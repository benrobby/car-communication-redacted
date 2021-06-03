/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import classNames from 'classnames';
import { ChatRecord } from '../chat-types';
import './chat-message-item.scss';
interface ChatMessageItemProps {
  record: ChatRecord;
  currentUserId: number;
  setChatUser: (userId: number) => void;
}
const ChatMessageItem = (props: ChatMessageItemProps) => {
  const { record, currentUserId, setChatUser } = props;
  const { message, sender, receiver, timestamp } = record;
  const { avatar } = sender;
  const isCurrentUser = currentUserId === sender.userId;
  const onAvatarClick = useCallback(() => {
    if (!isCurrentUser) {
      setChatUser(sender.userId);
    }
  }, [isCurrentUser, sender, setChatUser]);
  const chatMessage = Array.isArray(message) ? message : [message];
  return (
    <div className={classNames('chat-message-item', { myself: isCurrentUser })}>
      <Button
        className="chat-message-avatar"
        onClick={onAvatarClick}
        ghost
        shape="circle"
        size="large"
      >
        {avatar ? (
          <img src={avatar} className="chat-message-avatar-img" alt="" />
        ) : (
          <UserOutlined />
        )}
      </Button>
      <div className="chat-message-content">
        <div className={classNames('chat-message-info', { myself: isCurrentUser })}>
          <p className="chat-message-receiver">
            {isCurrentUser ? '' : sender.name}
          </p>
          <p className="chat-message-time">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        </div>
        <ul
          className={classNames('chat-message-text-list', { myself: isCurrentUser })}
        >
          {chatMessage.map((text, index) => (
            <li className={classNames('chat-message-text')} key={index}>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default ChatMessageItem;
