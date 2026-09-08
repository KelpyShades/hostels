"use client";

import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useRoomUpdate, type ManagerQueryArgs } from "./manager-hooks";
import type { ManagerRoom } from "./types";

type RoomPatch = Partial<{
  name: string;
  occupancy: 1 | 2 | 3 | 4;
  bathType: "shared" | "ensuite";
  pricePerYear: number;
  availableCount: number;
  accepting: boolean;
  amenities: string[];
}>;

/**
 * The manager's most common edits are one tap: flip accepting on/off,
 * step the rooms-left count. Full details live in the edit dialog.
 */
export function RoomCard({
  queryArgs,
  room,
  onEdit,
}: {
  queryArgs: ManagerQueryArgs;
  room: ManagerRoom;
  onEdit: () => void;
}) {
  const updateRoom = useRoomUpdate(queryArgs);

  async function patch(changes: RoomPatch) {
    try {
      await updateRoom({
        hostelId: queryArgs.hostelId,
        roomId: room._id,
        name: room.name,
        occupancy: room.occupancy,
        bathType: room.bathType,
        pricePerYear: room.pricePerYear,
        availableCount: room.availableCount,
        accepting: room.accepting,
        amenities: room.amenities ?? [],
        ...changes,
      });
    } catch {
      toast.error(content.toasts.saveFailed);
    }
  }

  const amenityLabels = (room.amenities ?? [])
    .map((value) => content.amenities.find((amenity) => amenity.value === value)?.label)
    .filter((label): label is string => Boolean(label));

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{room.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {content.occupancyLabels[room.occupancy]} · {content.bathLabels[room.bathType]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "hidden text-xs font-medium sm:block",
              room.accepting ? "text-primary" : "text-muted-foreground",
            )}
          >
            {room.accepting ? content.rooms.accepting : content.rooms.notAccepting}
          </span>
          <Switch
            checked={room.accepting}
            onCheckedChange={(checked) => void patch({ accepting: checked })}
            aria-label={content.rooms.accepting}
          />
        </div>
      </div>

      {amenityLabels.length > 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{amenityLabels.join(" · ")}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
        <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          GHS {room.pricePerYear.toLocaleString("en-GH")}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">{content.rooms.perYear}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted-foreground">{content.rooms.roomsLeft}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-full"
            disabled={room.availableCount === 0}
            onClick={() => void patch({ availableCount: room.availableCount - 1 })}
            aria-label={content.rooms.decreaseAvailable}
          >
            <Minus />
          </Button>
          <span className="w-7 text-center text-xl font-semibold tabular-nums text-foreground">
            {room.availableCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-full"
            onClick={() => void patch({ availableCount: room.availableCount + 1 })}
            aria-label={content.rooms.increaseAvailable}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          {content.rooms.details}
        </Button>
      </div>
    </article>
  );
}
