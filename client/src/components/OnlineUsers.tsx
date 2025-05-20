import { memo } from 'react';
import { Box, Typography, Avatar, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface OnlineUser {
  id: string;
  name: string;
  color: string;
}

interface OnlineUsersProps {
  users: OnlineUser[];
}

const UserAvatar = memo(({ user }: { user: OnlineUser }) => (
  <Tooltip title={user.name} arrow>
    <Avatar
      sx={{
        bgcolor: user.color,
        width: 32,
        height: 32,
        fontSize: '0.875rem',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
    >
      {user.name.charAt(0).toUpperCase()}
    </Avatar>
  </Tooltip>
));

UserAvatar.displayName = 'UserAvatar';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const OnlineUsers: React.FC<OnlineUsersProps> = ({ users }) => {
  console.log('Rendering OnlineUsers component with users:', users);

  return (
    <StyledBox>
      <Typography variant="subtitle2" color="textSecondary">
        Online:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {users.map((user) => (
          <UserAvatar key={user.id} user={user} />
        ))}
      </Box>
    </StyledBox>
  );
};

export default memo(OnlineUsers); 