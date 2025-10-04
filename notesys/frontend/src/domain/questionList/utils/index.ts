import {
  QuestionListCategory,
  QuestionListEntity,
  QuestionListParentNode,
  QuestionListType,
} from '../types/types.ts'

export function convertQuestionListToTreeStruct(
  questionLists: QuestionListEntity[] | undefined,
): QuestionListCategory[] {
  if (!questionLists) return []

  const result = [
    {
      key: QuestionListParentNode.COMMON,
      title: '普通题单',
      questionListId: undefined,
      children: [],
    },
    {
      key: QuestionListParentNode.TRAINING_CAMP,
      title: '专属题单',
      questionListId: undefined,
      children: [],
    },
  ] as QuestionListCategory[]

  for (const questionList of questionLists) {
    if (questionList.type === QuestionListType.COMMON_TYPE) {
      if (result[0].children) {
        result[0].children.push({
          key: questionList.questionListId,
          title: questionList.name,
          questionListId: questionList.questionListId,
          children: undefined,
        })
      }
    }
    if (questionList.type === QuestionListType.TRAINING_CAMP_TYPE) {
      if (result[1].children) {
        result[1].children.push({
          key: questionList.questionListId,
          title: questionList.name,
          questionListId: questionList.questionListId,
          children: undefined,
        })
      }
    }
  }

  return result
}
