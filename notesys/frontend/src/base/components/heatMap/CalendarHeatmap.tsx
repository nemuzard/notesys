import React, { ReactElement, useMemo } from 'react'
import './CalendarHeatmap.css'
import {
  DAYS_IN_WEEK,
  MILLISECONDS_IN_ONE_DAY,
  DAY_LABELS,
  MONTH_LABELS,
} from './constants'
import {
  dateNDaysAgo,
  shiftDate,
  getBeginningTimeForDate,
  convertToDate,
  getRange,
} from './utils'

// 定义组件的 props 接口
interface CalendarHeatmapProps {
  values: Array<{ date: string | number | Date }>
  numDays?: number
  startDate?: string | number | Date
  endDate?: string | number | Date
  gutterSize?: number
  horizontal?: boolean
  showMonthLabels?: boolean
  showWeekdayLabels?: boolean
  showOutOfRangeDays?: boolean
  tooltipDataAttrs?: object | ((value: any) => object)
  titleForValue?: (value: any) => string
  classForValue?: (value: any) => string
  monthLabels?: string[]
  weekdayLabels?: string[]
  onClick?: (value: any) => void
  onMouseOver?: (e: React.MouseEvent<SVGRectElement>, value: any) => void
  onMouseLeave?: (e: React.MouseEvent<SVGRectElement>, value: any) => void
  transformDayElement?: (
    element: ReactElement,
    value: any,
    index: number,
  ) => ReactElement
}

// 默认 props
const defaultProps: Partial<CalendarHeatmapProps> = {
  numDays: undefined,
  startDate: dateNDaysAgo(200),
  endDate: new Date(),
  gutterSize: 1,
  horizontal: true,
  showMonthLabels: true,
  showWeekdayLabels: false,
  showOutOfRangeDays: false,
  tooltipDataAttrs: undefined,
  titleForValue: undefined,
  classForValue: (value) => (value ? 'color-filled' : 'color-empty'),
  monthLabels: MONTH_LABELS,
  weekdayLabels: DAY_LABELS,
  onClick: undefined,
  onMouseOver: undefined,
  onMouseLeave: undefined,
  transformDayElement: undefined,
}

const SQUARE_SIZE = 10
const MONTH_LABEL_GUTTER_SIZE = 4
const CSS_PSEDUO_NAMESPACE = 'react-calendar-heatmap-'

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = (props) => {
  const {
    values,
    numDays,
    startDate,
    endDate,
    gutterSize,
    horizontal,
    showMonthLabels,
    showWeekdayLabels,
    showOutOfRangeDays,
    tooltipDataAttrs,
    titleForValue,
    monthLabels,
    weekdayLabels,
    classForValue,
    onClick,
    onMouseOver,
    onMouseLeave,
    transformDayElement,
  } = { ...defaultProps, ...props } as Required<CalendarHeatmapProps>

  // 计算开始日期和结束日期
  const getStartDate = () =>
    shiftDate(getEndDate(), -getDateDifferenceInDays() + 1)
  const getEndDate = () => getBeginningTimeForDate(convertToDate(endDate))

  // 根据 numDays 或 startDate 计算日期的差值
  const getDateDifferenceInDays = () => {
    if (numDays) {
      console.warn(
        'numDays is a deprecated prop. It will be removed in the next release. Consider using the startDate prop instead.',
      )
      return numDays
    }
    const timeDiff = getEndDate().getTime() - convertToDate(startDate).getTime()
    return Math.ceil(timeDiff / MILLISECONDS_IN_ONE_DAY)
  }

  // 获取开始日期前的空白天数
  const getNumEmptyDaysAtStart = () => getStartDate().getDay()

  // 获取带空天数的开始日期
  const getStartDateWithEmptyDays = () =>
    shiftDate(getStartDate(), -getNumEmptyDaysAtStart())

  // 获取值的 tooltip 属性
  const getTooltipDataAttrsForValue = (value: any) => {
    if (typeof tooltipDataAttrs === 'function') {
      return tooltipDataAttrs(value)
    }
    return tooltipDataAttrs
  }

  // 使用 useMemo 来缓存 valueCache
  const valueCache = useMemo(() => {
    if (!values) return []
    return values.reduce(
      (memo, value) => {
        const date = convertToDate(value.date)
        const index = Math.floor(
          (date.getTime() - getStartDateWithEmptyDays().getTime()) /
            MILLISECONDS_IN_ONE_DAY,
        )
        memo[index] = {
          value,
          className: classForValue(value),
          title: titleForValue ? titleForValue(value) : null,
          tooltipDataAttrs: getTooltipDataAttrsForValue(value),
        }
        return memo
      },
      {} as Record<number, any>,
    )
  }, [
    values,
    startDate,
    endDate,
    classForValue,
    titleForValue,
    tooltipDataAttrs,
  ])

  // 获取每个索引对应的值
  const getValueForIndex = (index: number) => valueCache[index]?.value ?? null

  // 获取每个索引对应的类名
  const getClassNameForIndex = (index: number) =>
    valueCache[index]?.className ?? classForValue(undefined)

  // 获取每个索引对应的标题
  const getTitleForIndex = (index: number) =>
    valueCache[index]?.title ?? (titleForValue ? titleForValue(null) : null)

  // 获取每个索引对应的 tooltip 属性
  const getTooltipDataAttrsForIndex = (index: number) =>
    valueCache[index]?.tooltipDataAttrs ??
    getTooltipDataAttrsForValue({
      date: null,
      count: null,
    })

  // 获取周数
  const getWeekCount = () => {
    const numDaysRoundedToWeek =
      getDateDifferenceInDays() +
      getNumEmptyDaysAtStart() +
      getNumEmptyDaysAtEnd()
    return Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK)
  }

  // 获取结束日期后的空白天数
  const getNumEmptyDaysAtEnd = () => DAYS_IN_WEEK - 1 - getEndDate().getDay()

  // 获取每周的 transform 属性
  const getTransformForWeek = (weekIndex: number) => {
    if (horizontal) {
      return `translate(${weekIndex * getSquareSizeWithGutter()}, 0)`
    }
    return `translate(0, ${weekIndex * getSquareSizeWithGutter()})`
  }

  // 获取方块大小加上间隔
  const getSquareSizeWithGutter = () => SQUARE_SIZE + gutterSize

  // 获取 transform 属性以显示所有周
  const getTransformForAllWeeks = () => {
    if (horizontal) {
      return `translate(${getWeekdayLabelSize()}, ${getMonthLabelSize()})`
    }
    return `translate(0, ${getWeekdayLabelSize()})`
  }

  // 获取 transform 属性以显示周标签
  const getTransformForWeekdayLabels = () => {
    if (horizontal) {
      return `translate(${SQUARE_SIZE}, ${getMonthLabelSize()})`
    }
    return undefined
  }

  // 获取 transform 属性以显示月标签
  const getTransformForMonthLabels = () => {
    if (horizontal) {
      return `translate(${getWeekdayLabelSize()}, 0)`
    }
    return `translate(${getWeekWidth() + MONTH_LABEL_GUTTER_SIZE}, ${getWeekdayLabelSize()})`
  }

  // 获取视图框的大小
  const getViewBox = () => {
    if (horizontal) {
      return `0 0 ${getWidth()} ${getHeight()}`
    }
    return `0 0 ${getHeight()} ${getWidth()}`
  }

  // 获取周宽度
  const getWeekWidth = () => DAYS_IN_WEEK * getSquareSizeWithGutter()

  // 获取宽度
  const getWidth = () =>
    getWeekCount() * getSquareSizeWithGutter() -
    (gutterSize - getWeekdayLabelSize())

  // 获取高度
  const getHeight = () =>
    getWeekWidth() + (getMonthLabelSize() - gutterSize) + getWeekdayLabelSize()

  // 获取月份标签的大小
  const getMonthLabelSize = () => {
    if (!showMonthLabels) {
      return 0
    }
    if (horizontal) {
      return SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE
    }
    return 2 * (SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE)
  }

  // 获取星期几标签的大小
  const getWeekdayLabelSize = () => {
    if (!showWeekdayLabels) {
      return 0
    }
    if (horizontal) {
      return 30
    }
    return SQUARE_SIZE * 1.5
  }

  // 获取小方块的坐标
  const getSquareCoordinates = (dayIndex: number) => {
    if (horizontal) {
      return [0, dayIndex * getSquareSizeWithGutter()]
    }
    return [dayIndex * getSquareSizeWithGutter(), 0]
  }

  // 渲染每个小方块
  const renderSquare = (dayIndex: number, index: number) => {
    const indexOutOfRange =
      index < getNumEmptyDaysAtStart() ||
      index >= getNumEmptyDaysAtStart() + getDateDifferenceInDays()

    if (indexOutOfRange && !showOutOfRangeDays) {
      return null
    }

    const value = getValueForIndex(index)
    const [x, y] = getSquareCoordinates(dayIndex)

    function generateToolTipContent(date: Date, count: number = 0) {
      if (!date) return ''
      date = new Date(date)
      const dateString = `${date.getMonth() + 1}月${date.getDate()}日`
      const countString = count ? `提交 ${count} 次笔记` : '未提交笔记'
      const rankString = `排名 ${value?.rank}`
      return `${dateString} ${countString} ${rankString}`
    }

    const rect = (
      <rect
        key={index}
        x={x}
        y={y}
        width={SQUARE_SIZE}
        height={SQUARE_SIZE}
        data-tooltip-id="heatMapToolTip"
        data-tooltip-content={generateToolTipContent(value?.date, value?.count)}
        data-tooltip-place="top"
        className={getClassNameForIndex(index)}
        onClick={() => onClick?.(value)}
        onMouseOver={(e) => onMouseOver?.(e, value)}
        onMouseLeave={(e) => onMouseLeave?.(e, value)}
        {...getTooltipDataAttrsForIndex(index)}
      >
        <title>{getTitleForIndex(index)}</title>
      </rect>
    )
    return transformDayElement ? transformDayElement(rect, value, index) : rect
  }

  // 渲染所有周
  const renderAllWeeks = () => {
    return getRange(getWeekCount()).map((weekIndex) => renderWeek(weekIndex))
  }

  // 渲染某一周
  const renderWeek = (weekIndex: number) => {
    return (
      <g
        key={weekIndex}
        transform={getTransformForWeek(weekIndex)}
        className={`${CSS_PSEDUO_NAMESPACE}week`}
      >
        {getRange(DAYS_IN_WEEK).map((dayIndex) =>
          renderSquare(dayIndex, weekIndex * DAYS_IN_WEEK + dayIndex),
        )}
      </g>
    )
  }

  // 渲染月份标签
  const renderMonthLabels = () => {
    if (!showMonthLabels) {
      return null
    }
    const weekRange = getRange(getWeekCount() - 1)
    return weekRange.map((weekIndex) => {
      const endOfWeek = shiftDate(
        getStartDateWithEmptyDays(),
        (weekIndex + 1) * DAYS_IN_WEEK,
      )
      const [x, y] = getMonthLabelCoordinates(weekIndex)
      return endOfWeek.getDate() >= 1 && endOfWeek.getDate() <= DAYS_IN_WEEK ? (
        <text
          key={weekIndex}
          x={x}
          y={y}
          className={`${CSS_PSEDUO_NAMESPACE}month-label`}
        >
          {monthLabels[endOfWeek.getMonth()]}
        </text>
      ) : null
    })
  }

  // 获取月份标签的坐标
  const getMonthLabelCoordinates = (weekIndex: number) => {
    if (horizontal) {
      return [
        weekIndex * getSquareSizeWithGutter(),
        getMonthLabelSize() - MONTH_LABEL_GUTTER_SIZE,
      ]
    }
    const verticalOffset = -2
    return [0, (weekIndex + 1) * getSquareSizeWithGutter() + verticalOffset]
  }

  // 渲染星期几标签
  const renderWeekdayLabels = () => {
    if (!showWeekdayLabels) {
      return null
    }
    return weekdayLabels!.map((weekdayLabel, dayIndex) => {
      const [x, y] = getWeekdayLabelCoordinates(dayIndex)
      const cssClasses = `$${horizontal ? '' : `${CSS_PSEDUO_NAMESPACE}small-text`} ${CSS_PSEDUO_NAMESPACE}weekday-label`
      return dayIndex % 2 === 1 ? (
        <text key={`${x}${y}`} x={x} y={y} className={cssClasses}>
          {weekdayLabel}
        </text>
      ) : null
    })
  }

  // 获取星期几标签的坐标
  const getWeekdayLabelCoordinates = (dayIndex: number) => {
    if (horizontal) {
      return [0, (dayIndex + 1) * SQUARE_SIZE + dayIndex * gutterSize]
    }
    return [dayIndex * SQUARE_SIZE + dayIndex * gutterSize, SQUARE_SIZE]
  }

  // 渲染组件
  return (
    <svg className="react-calendar-heatmap" viewBox={getViewBox()}>
      <g
        transform={getTransformForMonthLabels()}
        className={`${CSS_PSEDUO_NAMESPACE}month-labels`}
      >
        {renderMonthLabels()}
      </g>
      <g
        transform={getTransformForAllWeeks()}
        className={`${CSS_PSEDUO_NAMESPACE}all-weeks`}
      >
        {renderAllWeeks()}
      </g>
      <g
        transform={getTransformForWeekdayLabels()}
        className={`${CSS_PSEDUO_NAMESPACE}weekday-labels`}
      >
        {renderWeekdayLabels()}
      </g>
    </svg>
  )
}

export default CalendarHeatmap
