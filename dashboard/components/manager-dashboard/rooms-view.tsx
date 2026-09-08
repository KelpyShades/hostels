"use client";

import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import { EmptyState } from "./empty-state";
import { RoomCard } from "./room-card";
import { RoomDialog } from "./room-dialog";
import type { ManagerQueryArgs } from "./manager-hooks";
import type { ManagerData, ManagerRoom } from "./types";

function sortRooms(rooms: ManagerRoom[]) {
  return [...rooms].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * One branch's rooms — the flat list a branch workspace (or a unit
 * hostel) renders. Branch management lives at the Branches hub; this view
 * is purely rooms: one-tap edits on the card, full details in the dialog.
 */
export function RoomsView({
  hostelId,
  queryArgs,
  data,
}: {
  hostelId: Id<"hostels">;
  queryArgs: ManagerQueryArgs;
  data: ManagerData;
}) {
  const ensureSetup = useMutation(api.manager.ensureSetup);
  const [roomDialog, setRoomDialog] = useState<{ branchId: Id<"branches">; room: ManagerRoom | null } | null>(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  const branches = [...data.branches].sort((a, b) => a.sortOrder - b.sortOrder);
  const branch = branches[0];
  const rooms = sortRooms(
    branch ? data.rooms.filter((room) => room.branchId === branch._id) : data.rooms,
  );

  // Unit hostels lazily create their implicit branch before the first room.
  async function openAddRoom() {
    let target: Id<"branches"> | undefined = branch?._id;
    if (!target) {
      setBootstrapping(true);
      try {
        const ensured = await ensureSetup({ hostelId });
        if (ensured) target = ensured;
      } catch {
        toast.error(content.toasts.saveFailed);
      }
      setBootstrapping(false);
    }
    if (target) setRoomDialog({ branchId: target, room: null });
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button type="button" onClick={() => void openAddRoom()} disabled={bootstrapping}>
          <Plus /> {content.rooms.addRoom}
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title={content.rooms.emptyRoomsTitle}
            body={content.rooms.emptyRoomsBody}
            action={
              <Button type="button" onClick={() => void openAddRoom()}>
                <Plus /> {content.rooms.addRoom}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {rooms.map((room) => (
            <RoomCard
              key={room._id}
              queryArgs={queryArgs}
              room={room}
              onEdit={() => branch && setRoomDialog({ branchId: branch._id, room })}
            />
          ))}
        </div>
      )}

      {roomDialog ? (
        <RoomDialog
          hostelId={hostelId}
          branchId={roomDialog.branchId}
          room={roomDialog.room}
          onClose={() => setRoomDialog(null)}
        />
      ) : null}
    </div>
  );
}
