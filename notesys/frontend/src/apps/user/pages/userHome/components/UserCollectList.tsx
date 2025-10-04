import React from 'react'

interface UserCollectListProps {
  userId?: string
}

const UserCollectList: React.FC<UserCollectListProps> = ({ userId }) => {
  return <div>{userId}</div>
}

export default UserCollectList
