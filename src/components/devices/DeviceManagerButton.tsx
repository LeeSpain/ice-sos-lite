import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, Cog, HeartPulse, PlugZap, PowerOff } from "lucide-react";

// Minimal typings to avoid TS issues on browsers without Web Bluetooth types
declare global {
  interface Navigator {
    bluetooth?: any;
  }
}

const hrService = "heart_rate";
const hrCharacteristic = "heart_rate_measurement";

const parseHeartRate = (event: any): number => {
  try {
    const value: DataView = event.target.value;
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) === 0x01;
    return is16Bit ? value.getUint16(1, /*littleEndian*/ true) : value.getUint8(1);
  } catch {
    return 0;
  }
};

const DeviceManagerButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState<boolean>(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string>("");
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [batteryPct, setBatteryPct] = useState<number | null>(null);
  const [useSimulator, setUseSimulator] = useState<boolean>(true);

  const deviceRef = useRef<any>(null);
  const serverRef = useRef<any>(null);
  const hrCharRef = useRef<any>(null);
  const simIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setSupported(Boolean(navigator.bluetooth));
  }, []);

  useEffect(() => {
    if (useSimulator && open && !connected) {
      // start simulator
      if (!simIntervalRef.current) {
        simIntervalRef.current = window.setInterval(() => {
          setHeartRate((prev) => {
            const base = prev ?? 72;
            const next = Math.max(58, Math.min(120, base + (Math.random() * 6 - 3)));
            return Math.round(next);
          });
          setBatteryPct((prev) => {
            const base = prev ?? 88;
            return Math.max(1, Math.min(100, base - (Math.random() < 0.1 ? 1 : 0)));
          });
        }, 1200);
      }
      return () => {
        if (simIntervalRef.current) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
        }
      };
    }
    // Cleanup when not simulating
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  }, [useSimulator, open, connected]);

  const connect = async () => {
    try {
      if (!navigator.bluetooth) {
        setUseSimulator(true);
        setOpen(true);
        return;
      }
      setConnecting(true);
      setUseSimulator(false);
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [hrService] }],
        optionalServices: ["battery_service"],
      });
      deviceRef.current = device;
      setDeviceName(device?.name || "Unknown device");

      const server = await device.gatt.connect();
      serverRef.current = server;
      setConnected(true);

      // Heart Rate notifications
      const service = await server.getPrimaryService(hrService);
      const characteristic = await service.getCharacteristic(hrCharacteristic);
      hrCharRef.current = characteristic;
      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", (event: any) => {
        const hr = parseHeartRate(event);
        if (hr) setHeartRate(hr);
      });

      // Battery (best-effort)
      try {
        const battSvc = await server.getPrimaryService("battery_service");
        const battChar = await battSvc.getCharacteristic("battery_level");
        const value: DataView = await battChar.readValue();
        setBatteryPct(value.getUint8(0));
      } catch {
        // ignore if not available
      }
    } catch (e) {
      console.warn("Bluetooth connect error", e);
      setConnected(false);
      setUseSimulator(true);
    } finally {
      setConnecting(false);
      setOpen(true);
    }
  };

  const disconnect = async () => {
    try {
      if (hrCharRef.current) {
        try { await hrCharRef.current.stopNotifications(); } catch {}
        hrCharRef.current = null;
      }
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
    } finally {
      setConnected(false);
      setDeviceName("");
    }
  };

  const StatusBadge = useMemo(() => (
    connected ? (
      <Badge variant="secondary" className="gap-1"> <PlugZap className="h-3 w-3" /> Connected </Badge>
    ) : useSimulator ? (
      <Badge variant="outline" className="gap-1"> <HeartPulse className="h-3 w-3" /> Simulator </Badge>
    ) : supported ? (
      <Badge variant="outline">Ready</Badge>
    ) : (
      <Badge variant="destructive">Not supported</Badge>
    )
  ), [connected, useSimulator, supported]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="shadow-lg hover-scale" size="icon" aria-label="Devices & Settings">
            <Cog className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Devices & Sensors</DialogTitle>
            <DialogDescription>Connect Bluetooth devices or use the simulator for live preview data.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Status</div>
              {StatusBadge}
            </div>

            <Card className="p-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Device</div>
                  <div className="font-medium">{deviceName || (useSimulator ? "Simulator" : "—")}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Heart Rate</div>
                  <div className="font-medium">{heartRate ? `${heartRate} bpm` : "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Battery</div>
                  <div className="font-medium">{batteryPct !== null ? `${batteryPct}%` : "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Support</div>
                  <div className="font-medium">{supported ? "Web Bluetooth" : "Use Capacitor on mobile"}</div>
                </div>
              </div>
            </Card>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant={useSimulator ? "default" : "outline"} size="sm" onClick={() => setUseSimulator(true)}>
                <HeartPulse className="mr-2 h-4 w-4" /> Use Simulator
              </Button>
              <Button variant={useSimulator ? "outline" : "secondary"} size="sm" onClick={() => setUseSimulator(false)} disabled={!supported}>
                <Bluetooth className="mr-2 h-4 w-4" /> Use Bluetooth
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {!connected ? (
                <Button onClick={connect} disabled={connecting || (!supported && !useSimulator)}>
                  <PlugZap className="mr-2 h-4 w-4" /> {connecting ? "Connecting..." : "Scan & Connect"}
                </Button>
              ) : (
                <Button variant="destructive" onClick={disconnect}>
                  <PowerOff className="mr-2 h-4 w-4" /> Disconnect
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeviceManagerButton;
