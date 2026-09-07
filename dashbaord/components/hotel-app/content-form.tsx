"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContentForm() {
  const [saved, setSaved] = useState(false);
  return <Card><CardHeader><CardTitle>Public site content</CardTitle><CardDescription>Keep the owner&apos;s voice clear and current. Photos and testimonials can be added from this workspace once R2 credentials are connected.</CardDescription></CardHeader><CardContent><form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 1800); }}><div className="grid gap-2"><Label htmlFor="hostel-name">Hostel name</Label><Input id="hostel-name" defaultValue="Aseda Heights Hostel" /></div><div className="grid gap-2"><Label htmlFor="tagline">Tagline</Label><Input id="tagline" defaultValue="A quiet, well-kept home eight minutes from the KNUST main gate." /></div><div className="grid gap-2"><Label htmlFor="about">About copy</Label><Textarea id="about" defaultValue="We have run this house for eleven years. The rooms are clean, the plant comes on when the lights go, and water is never a discussion here." /></div><div className="flex items-center justify-between gap-4"><p className="text-xs text-slate-400">Changes will be reflected on the public site after saving.</p><Button type="submit">{saved ? "Saved" : "Save content"}</Button></div></form></CardContent></Card>;
}
