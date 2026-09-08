"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { content } from "@/lib/content";
import { roomFormSchema, type RoomFormInput, type RoomFormOutput } from "@/lib/forms";
import { cn } from "@/lib/utils";
import type { ManagerRoom } from "./types";

export function RoomDialog({
  hostelId,
  branchId,
  room,
  onClose,
}: {
  hostelId: Id<"hostels">;
  branchId: Id<"branches">;
  room: ManagerRoom | null;
  onClose: () => void;
}) {
  const createRoom = useMutation(api.manager.createRoom);
  const updateRoom = useMutation(api.manager.updateRoom);
  const deleteRoom = useMutation(api.manager.deleteRoom);

  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm<RoomFormInput, unknown, RoomFormOutput>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: room?.name ?? "",
      occupancy: room ? (String(room.occupancy) as "1" | "2" | "3" | "4") : "4",
      bathType: room?.bathType ?? "shared",
      pricePerYear: room ? String(room.pricePerYear) : "",
      availableCount: String(room?.availableCount ?? 0),
      accepting: room?.accepting ?? true,
      amenities: room?.amenities ?? [],
    },
  });

  const errors = form.formState.errors;
  const amenities = useWatch({ control: form.control, name: "amenities" });

  function close() {
    setOpen(false);
    setTimeout(onClose, 150);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      if (room) {
        await updateRoom({ hostelId, roomId: room._id, ...values });
        toast.success(content.toasts.roomSaved);
      } else {
        await createRoom({ hostelId, branchId, ...values });
        toast.success(content.toasts.roomAdded);
      }
      close();
    } catch {
      toast.error(content.toasts.saveFailed);
    }
    setSaving(false);
  });

  async function remove() {
    if (!room) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    try {
      await deleteRoom({ hostelId, roomId: room._id });
      toast.success(content.toasts.roomDeleted);
      close();
    } catch {
      toast.error(content.toasts.saveFailed);
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{room ? content.room.editTitle : content.room.addTitle}</DialogTitle>
          <DialogDescription>{content.rooms.descriptionUnit}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={onSubmit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="room-name">{content.room.name}</Label>
            <Input
              id="room-name"
              placeholder={content.room.namePlaceholder}
              autoComplete="off"
              {...form.register("name")}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="room-occupancy">{content.room.occupancy}</Label>
              <Select id="room-occupancy" {...form.register("occupancy")}>
                {(["4", "3", "2", "1"] as const).map((value) => (
                  <option key={value} value={value}>
                    {content.occupancyLabels[Number(value) as 1 | 2 | 3 | 4]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-bath">{content.room.bath}</Label>
              <Select id="room-bath" {...form.register("bathType")}>
                <option value="shared">{content.bathLabels.shared}</option>
                <option value="ensuite">{content.bathLabels.ensuite}</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="room-price">{content.room.price}</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  GHS
                </span>
                <Input
                  id="room-price"
                  inputMode="numeric"
                  autoComplete="off"
                  className="pl-11"
                  {...form.register("pricePerYear")}
                />
              </div>
              {errors.pricePerYear ? (
                <p className="text-xs text-destructive">{errors.pricePerYear.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-available">{content.room.available}</Label>
              <Input
                id="room-available"
                inputMode="numeric"
                autoComplete="off"
                {...form.register("availableCount")}
              />
              {errors.availableCount ? (
                <p className="text-xs text-destructive">{errors.availableCount.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{content.room.accepting}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{content.room.acceptingHint}</p>
            </div>
            <Controller
              control={form.control}
              name="accepting"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label={content.room.accepting}
                />
              )}
            />
          </div>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium leading-none text-foreground">
              {content.room.amenities}
            </legend>
            <div className="flex flex-wrap gap-2">
              {content.amenities.map((amenity) => {
                const selected = amenities.includes(amenity.value);
                return (
                  <button
                    key={amenity.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      form.setValue(
                        "amenities",
                        selected
                          ? amenities.filter((value) => value !== amenity.value)
                          : [...amenities, amenity.value],
                        { shouldDirty: true },
                      )
                    }
                    className={cn(
                      "min-h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {amenity.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter className="gap-2 sm:justify-between">
            {room ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => void remove()}
                disabled={saving}
              >
                {confirmDelete ? content.confirmDelete : content.room.delete}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {room ? content.room.save : content.room.addTitle}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
