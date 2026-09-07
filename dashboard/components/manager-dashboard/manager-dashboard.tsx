"use client";

import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { BedDouble, Check, Inbox, Phone, RefreshCw } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagerSidebar } from "./manager-sidebar";
import { RoomForm } from "./room-form";
import type { ManagerData, ManagerInquiry, ManagerRoom } from "./types";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function timeAgo(timestamp: number) {
  const hours = Math.floor((Date.now() - timestamp) / 3600000);
  return hours < 1 ? "Less than an hour ago" : `${hours}h ago`;
}

function ManagerDataView({ hostelId, data }: { hostelId: string; data: ManagerData }) {
  const [active, setActive] = useState<"inbox" | "rooms">("inbox");
  const updateRoom = useMutation(api.manager.updateRoom);
  const updateInquiryStatus = useMutation(api.manager.updateInquiryStatus);
  const [roomValues, setRoomValues] = useState(data.rooms);
  const [inquiryValues, setInquiryValues] = useState(data.inquiries);
  const newCount = inquiryValues.filter((inquiry) => inquiry.status === "new").length;
  const openRooms = roomValues.reduce((sum, room) => sum + (room.accepting ? room.availableCount : 0), 0);

  async function saveRoom(room: ManagerRoom, values: { price: number; available: number; accepting: boolean }) {
    await updateRoom({
      hostelId: hostelId as Id<"hostels">,
      roomId: room._id as Id<"rooms">,
      pricePerSemester: values.price,
      availableCount: values.available,
      accepting: values.accepting,
    });
    setRoomValues((current) => current.map((item) => item._id === room._id ? { ...item, pricePerSemester: values.price, availableCount: values.available, accepting: values.accepting } : item));
  }

  async function updateStatus(inquiry: ManagerInquiry, status: ManagerInquiry["status"]) {
    await updateInquiryStatus({ hostelId: hostelId as Id<"hostels">, inquiryId: inquiry._id as Id<"inquiries">, status });
    setInquiryValues((current) => current.map((item) => item._id === inquiry._id ? { ...item, status } : item));
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#17212b]">
      <ManagerSidebar
        active={active}
        onActiveChange={setActive}
        hostelName={data.hostel.name}
        branchName={data.branches.length > 1 ? `${data.branches.length} locations` : data.branches[0]?.name}
      />
      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-5 sm:px-8 lg:px-10 lg:pt-10">
          <header className="mb-7 border-b border-[#dce5e1] pb-6 sm:mb-9 sm:pb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-[#66727d]">{data.hostel.name}</p>
                <h1 className="max-w-xl text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                  {active === "inbox" ? "Keep every enquiry moving." : "Keep availability current."}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#66727d]">
                  {active === "inbox" ? "Your students are waiting for a clear answer. Start with the newest conversations." : "Change the price, number of rooms left, or whether you are accepting enquiries."}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => window.location.reload()} aria-label="Refresh dashboard">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="mb-7 grid grid-cols-2 gap-3 sm:gap-4">
            <Card className="border-0 bg-[#d8f2e7] shadow-none">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between"><Inbox className="h-5 w-5 text-[#227052]" /><span className="text-xs font-semibold text-[#227052]">Needs action</span></div>
                <p className="mt-5 text-3xl font-bold tracking-tight">{newCount}</p>
                <p className="mt-1 text-xs text-[#527066]">new enquiries</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-[#17212b] text-white shadow-none">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between"><BedDouble className="h-5 w-5 text-[#f2b84b]" /><span className="text-xs font-semibold text-[#c5d0d5]">Live now</span></div>
                <p className="mt-5 text-3xl font-bold tracking-tight">{openRooms}</p>
                <p className="mt-1 text-xs text-[#aab7bd]">rooms available</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={active}>
            <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b border-[#dce5e1] bg-transparent p-0">
              <TabsTrigger value="inbox" className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-1 text-[#66727d] data-[state=active]:border-[#17212b] data-[state=active]:bg-transparent data-[state=active]:text-[#17212b]">
                Inbox{newCount > 0 ? <span className="ml-2 rounded-full bg-[#f2b84b] px-1.5 py-0.5 text-[10px]">{newCount}</span> : null}
              </TabsTrigger>
              <TabsTrigger value="rooms" className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-1 text-[#66727d] data-[state=active]:border-[#17212b] data-[state=active]:bg-transparent data-[state=active]:text-[#17212b]">Rooms</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-5">
              <Card className="border-[#dce5e1] shadow-none">
                <CardHeader className="px-4 pb-3 pt-5 sm:px-6"><CardTitle className="text-lg">Student enquiries</CardTitle><CardDescription>Contact a student, then mark the enquiry as contacted or booked.</CardDescription></CardHeader>
                <CardContent className="space-y-3 px-4 pb-5 sm:px-6">
                  {inquiryValues.length === 0 ? <div className="py-10 text-center text-sm text-[#66727d]">No enquiries yet.</div> : inquiryValues.map((inquiry) => (
                    <div key={inquiry._id} className="border-t border-[#edf1ef] py-4 first:border-t-0">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{inquiry.name}</p><Badge variant={inquiry.status}>{inquiry.status}</Badge></div>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#66727d]"><span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{inquiry.phone}</span><span>{inquiry.roomName}</span><span>Move-in {inquiry.moveInDate}</span><span>{timeAgo(inquiry.createdAt)}</span></div>
                          {inquiry.message ? <p className="mt-3 text-sm leading-6 text-[#42515a]">{inquiry.message}</p> : null}
                        </div>
                        <select aria-label={`Update ${inquiry.name} status`} value={inquiry.status} onChange={(event) => updateStatus(inquiry, event.target.value as ManagerInquiry["status"])} className="min-h-11 rounded-xl border border-[#dce5e1] bg-white px-3 text-sm font-semibold text-[#17212b]"><option value="new">New</option><option value="contacted">Contacted</option><option value="booked">Booked</option></select>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rooms" className="mt-5">
              <Card className="border-[#dce5e1] shadow-none">
                <CardHeader className="px-4 pb-3 pt-5 sm:px-6"><CardTitle className="text-lg">Rooms & availability</CardTitle><CardDescription>Only price, rooms left, and accepting enquiries can be changed here.</CardDescription></CardHeader>
                <CardContent className="space-y-5 px-4 pb-5 sm:px-6">
                  {roomValues.map((room, index) => <div key={room._id}><div className="mb-3 flex items-start justify-between gap-3"><div><p className="font-semibold">{room.name}</p><p className="mt-1 text-xs text-[#66727d]">{room.occupancy}-in-1 · {room.bathType} bath</p></div>{room.accepting ? <Badge variant="live">Accepting</Badge> : <Badge variant="paused">Closed</Badge>}</div><RoomForm room={room} onSave={(values) => saveRoom(room, values)} />{index < roomValues.length - 1 ? <Separator className="mt-5 bg-[#dce5e1]" /> : null}</div>)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export function ManagerDashboard({ hostelId }: { hostelId: string }) {
  if (!convexUrl || !hostelId) return <ManagerUnavailable message={!hostelId ? "This dashboard has no hostel configured yet." : "Convex is not configured for this dashboard."} />;
  const client = new ConvexReactClient(convexUrl);
  return <ConvexProvider client={client}><ManagerDashboardData hostelId={hostelId} /></ConvexProvider>;
}

function ManagerDashboardData({ hostelId }: { hostelId: string }) {
  const data = useQuery(api.manager.get, { hostelId: hostelId as Id<"hostels"> });
  if (data === undefined) return <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6] text-sm text-[#66727d]">Loading your hostel dashboard...</div>;
  if (data === null) return <ManagerUnavailable message="This hostel dashboard is not configured yet." />;
  return <ManagerDataView hostelId={hostelId} data={data as ManagerData} />;
}

function ManagerUnavailable({ message }: { message: string }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-5"><Card className="w-full max-w-md border-[#dce5e1] shadow-none"><CardHeader><div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2b84b] text-[#17212b]"><Check className="h-5 w-5" /></div><CardTitle>Dashboard unavailable</CardTitle><CardDescription>{message}</CardDescription></CardHeader><CardContent><p className="text-sm leading-6 text-[#66727d]">Ask the person who set up your hostel website to check the dashboard configuration.</p></CardContent></Card></main>;
}
