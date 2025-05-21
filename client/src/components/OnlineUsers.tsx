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
        width: 24, // Reduced size for better UX
        height: 24, // Reduced size for better UX
        fontSize: '0.75rem', // Adjusted font size for smaller icon
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
  // console.log('Rendering OnlineUsers component with users:', users);

  // Sort users by name for a better UX
  const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <StyledBox>
      <Typography variant="h6" color="textPrimary">
        Online:
      </Typography> {/* Improved header for better UX */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {sortedUsers.map((user) => (
          <Box key={user.id} sx={{ display: 'flex', alignItems: 'center' }}>
            <UserAvatar user={user} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {user.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </StyledBox>
  );
};

export default memo(OnlineUsers); 