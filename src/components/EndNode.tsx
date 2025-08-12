"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EndNode = () => {
    return (
        <Card className="w-48 border-2 border-red-500/80 shadow-red-500/50">
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    <StopCircle className="h-6 w-6 text-red-500" />
                    <p className="text-lg font-semibold">End</p>
                </div>
                <Handle
                    type="target"
                    position={Position.Top}
                    id="end-target"
                    className="!bg-primary"
                />
            </CardContent>
        </Card>
    );
};

EndNode.displayName = "EndNode";
