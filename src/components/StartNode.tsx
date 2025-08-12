"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StartNode = () => {
    return (
        <Card className="w-48 border-2 border-green-500/80 shadow-green-500/50">
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    <PlayCircle className="h-6 w-6 text-green-500" />
                    <p className="text-lg font-semibold">Start</p>
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="start-source"
                    className="!bg-primary"
                />
            </CardContent>
        </Card>
    );
};

StartNode.displayName = "StartNode";
