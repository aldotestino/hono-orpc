import { Trash2 } from 'lucide-react';
import ConfirmAction from '@/components/confirm-action';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

function ChannelSettings({
  onDeleteChannel,
}: {
  onDeleteChannel: () => void;
  channelUuid: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Settings</h2>
      <div className="flex items-center justify-between">
        <Label>Enable AI Messages</Label>
        <Switch />
      </div>
      <ConfirmAction
        action={onDeleteChannel}
        description="Are you sure you want to delete this channel?"
        title="Delete Channel"
      >
        <Button className="w-full" variant="destructive">
          <Trash2 />
          Delete Channel
        </Button>
      </ConfirmAction>
    </div>
  );
}

export default ChannelSettings;
