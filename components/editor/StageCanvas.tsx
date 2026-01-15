"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from "react-konva";
import { Box } from "@/types/ingestion";

function useHtmlImage(url: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) return;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setImg(image);
    image.onerror = () => setImg(null);
    image.src = url;
  }, [url]);
  return img;
}

export function StageCanvas({
  imageUrl,
  boxes,
  selectedId,
  onSelect,
  onChangeBox,
}: {
  imageUrl: string | null;
  boxes: Box[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeBox: (id: string, patch: Partial<Box>) => void;
}) {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const img = useHtmlImage(imageUrl);

  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // attach transformer
  useEffect(() => {
    const stage = stageRef.current;
    const tr = trRef.current;
    if (!stage || !tr) return;
    const node = selectedId ? stage.findOne(`#box-${selectedId}`) : null;
    if (node) {
      tr.nodes([node as any]);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedId, boxes]);

  // keyboard for panning
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") setIsPanning(true);
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setIsPanning(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const canvasSize = useMemo(() => ({ width: 900, height: 600 }), []);

  function onWheel(e: any) {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // zoom only when ctrlKey pressed (trackpad pinch) or always? We'll require ctrl for safety
    if (!e.evt.ctrlKey) return;

    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.05;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();

    setScale(newScale);
    setStagePos(newPos);
  }

  return (
    <div className="w-full h-[600px]">
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={isPanning}
        onDragEnd={(e) => {
          // NOTE: drag events bubble in Konva. Use currentTarget (Stage) instead of target (may be a Rect)
          // so dragging a box will NOT update stage position.
          if (!isPanning) return;
          const st = e.currentTarget;
          setStagePos({ x: st.x(), y: st.y() });
        }}
        onWheel={onWheel}
        onMouseDown={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) onSelect(null);
        }}
      >
        <Layer>
          {img ? <KonvaImage image={img} x={0} y={0} /> : null}

          {boxes.map((b) => (
            <Rect
              key={b.id}
              id={`box-${b.id}`}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              stroke={b.id === selectedId ? "white" : "yellow"}
              strokeWidth={2}
              draggable={!isPanning}
              onClick={() => onSelect(b.id)}
              onTap={() => onSelect(b.id)}
              onDragEnd={(e) => onChangeBox(b.id, { x: e.target.x(), y: e.target.y() })}
              onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                // reset scale to avoid compounding
                node.scaleX(1);
                node.scaleY(1);
                const next = {
                  x: node.x(),
                  y: node.y(),
                  w: Math.max(4, node.width() * scaleX),
                  h: Math.max(4, node.height() * scaleY),
                };
                onChangeBox(b.id, next);
              }}
            />
          ))}

          <Transformer ref={trRef} rotateEnabled={false} />
        </Layer>
      </Stage>
    </div>
  );
}
