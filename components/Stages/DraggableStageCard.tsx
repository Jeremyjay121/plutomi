import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function DraggableStageCard({
  name,
  current_stage_id,
  opening_id,
}) {
  const router = useRouter();
  const { stage_id } = router.query;

  return (
    <div
      className={`border my-2   py-4 text-center  ${
        stage_id === current_stage_id
          ? "bg-sky-50 border-t-4 border-t-blue-500"
          : "bg-white"
      }  shadow-md hover:shadow-xl transition ease-in-out duration-300 rounded-xl overflow-hidden`}
    >
      <h5 className=" px-2 text-md font-medium text-dark truncate">{name}</h5>

      <dd className="flex items-center  justify-center">
        <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
          <UserGroupIcon className="w-5 h-5 0" />
          <p className="text-md font-semibold ">
            <NumberFormat
              value={100}
              thousandSeparator={true}
              displayType={"text"}
            />
          </p>
        </div>
      </dd>
    </div>
  );
}