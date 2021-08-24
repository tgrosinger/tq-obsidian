<script lang="ts">
  import type { Moment } from 'moment';
  import { Calendar } from 'obsidian-calendar-ui';

  export let close: () => void;
  export let set: (date: Moment) => void;
  export let startDate: Moment;

  const onClickDay = async (
    selectedDate: Moment,
    isMetaPressed: boolean,
  ): Promise<void> => {
    set(selectedDate);
    if (close) {
      close();
    }
  };
</script>

<Calendar {onClickDay} today={startDate} showWeekNums={false} />
