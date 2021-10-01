import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { mutate } from "swr";
import difference from "../../utils/getObjectDifference";
import Link from "next/dist/client/link";
import StageModal from "./StageModal";
import { GetRelativeTime } from "../../utils/time";
import StageReorderColumn from "../StageReorderColumn";
import QuestionList from "../Questions/QuestionList";
import { useEffect } from "react";
import { PlusIcon } from "@heroicons/react/outline";
import axios from "axios";
import useStore from "../../utils/store";
import QuestionModal from "../Questions/QuestionModal";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableStageCard from "../../components/Stages/DraggableStageCard";
import Loader from "../Loader";
import useUser from "../../SWR/useUser";
import { useState } from "react";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
import useStageById from "../../SWR/useStageById";
export default function StageSettingsContent() {
  const createQuestion = async () => {
    const body: APICreateQuestionInput = {
      GSI1SK: questionModal.GSI1SK,
      question_description: questionModal.question_description,
    };
    try {
      const { data } = await axios.post(
        `/api/openings/${opening_id}/stages/${stage_id}/questions`,
        body
      );
      alert(data.message);
      setQuestionModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        question_id: "",
        question_description: "",
        GSI1SK: "",
      });
    } catch (error) {
      console.error(`Error creating`, error);
      alert(error.response.data.message);
    }

    // Refresh the question_order
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);

    // Refresh the question list
    mutate(
      `/api/orgs/${user.org_id}/public/openings/${opening_id}/stages/${stage_id}/questions`
    );
  };

  const updateQuestion = async () => {
    try {
      const question = questions.find(
        (question) => question.question_id == questionModal.question_id
      );

      // Get the difference between the question returned from SWR
      // And the updated question in the modal
      const diff = difference(question, questionModal);

      // Delete the two modal controlling keys
      delete diff["is_modal_open"];
      delete diff["modal_mode"];

      console.log(`Difference between the two objects`, diff);
      const body = {
        updated_question: diff,
      };

      const { data } = await axios.put(
        `/api/openings/${opening_id}/stages/${stage_id}/questions/${questionModal.question_id}`,
        body
      );
      alert(data.message);
      setQuestionModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        question_id: "",
        question_description: "",
        GSI1SK: "",
      });
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the question_order
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);

    // Refresh the question list
    mutate(
      `/api/orgs/${user.org_id}/public/openings/${opening_id}/stages/${stage_id}/questions`
    );
  };

  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening?.opening_id
  );
  const stageModal = useStore((state: PlutomiState) => state.stageModal);
  const setStageModal = useStore((state: PlutomiState) => state.setStageModal);

  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening?.opening_id,
    stage_id as string
  );

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(user?.org_id, opening?.opening_id, stage?.stage_id);

  const questionModal = useStore((state: PlutomiState) => state.questionModal);
  const setQuestionModal = useStore(
    (state: PlutomiState) => state.setQuestionModal
  );

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    // TODO i think here we should render the column
    return <Loader text="Loading stages..." />;
  }

  return (
    <>
      <QuestionModal
        createQuestion={createQuestion}
        updateQuestion={updateQuestion}
      />

      {/* 3 column wrapper */}
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 min-w-0 bg-white xl:flex">
          <div className="border-b border-gray-200 xl:border-b-0 xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200 bg-white">
            <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
              {/* Start left column area */}
              <StageReorderColumn />
              {/* End left column area */}
            </div>
          </div>

          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
              {/* Start main area*/}
              <div className="relative h-full" style={{ minHeight: "36rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  <div className="flex flex-col justify-center items-center">
                    <h1 className="text-center text-2xl font-semibold mb-4">
                      {stage?.GSI1SK} Settings
                    </h1>
                    <div className="flex justify-center space-x-4 py-2 items-center">
                      <p className="text-md text-light text-center">
                        Created {GetRelativeTime(stage?.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <QuestionList />
              </div>
              {/* End main area */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
