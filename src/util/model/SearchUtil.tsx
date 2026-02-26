import {h, ref, render, nextTick} from "vue";

export function openSearchModel(): Promise<string> {
  return new Promise<string>(resolve => {
    const visible = ref(true);
    const inputValue = ref("");
    const inputRef = ref<HTMLInputElement>();

    const handleClose = () => {
      visible.value = false;
    };

    const handleMaskClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains("search-mask")) {
        handleClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && inputValue.value.trim()) {
        resolve(inputValue.value.trim());
        handleClose();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    const container = document.createElement("div");
    document.body.appendChild(container);

    const close = () => {
      render(null, container);
      container.remove();
    };

    const vnode = h("div", {
      class: "search-mask",
      style: {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "15vh",
        zIndex: "9999",
        opacity: visible.value ? "1" : "0",
        transition: "opacity 0.3s ease"
      },
      onClick: handleMaskClick
    }, [
      h("input", {
        ref: inputRef,
        type: "text",
        value: inputValue.value,
        placeholder: "搜索...",
        style: {
          width: "500px",
          maxWidth: "90%",
          padding: "16px 20px",
          fontSize: "18px",
          borderRadius: "8px",
          border: "none",
          outline: "none",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          backgroundColor: "white",
          transform: visible.value ? "scale(1)" : "scale(0.8)",
          opacity: visible.value ? "1" : "0",
          transition: "transform 0.3s ease, opacity 0.3s ease"
        },
        onInput: (e: Event) => {
          inputValue.value = (e.target as HTMLInputElement).value;
        },
        onKeydown: handleKeyDown,
        onClick: (e: MouseEvent) => {
          e.stopPropagation();
        }
      })
    ]);

    render(vnode, container);

    nextTick(() => {
      const inputElement = container.querySelector("input");
      inputElement?.focus();
    });

    const checkVisible = () => {
      if (!visible.value) {
        cancelAnimationFrame(animationFrameId);
        close();
      } else {
        animationFrameId = requestAnimationFrame(checkVisible);
      }
    };
    let animationFrameId = requestAnimationFrame(checkVisible);
  });
}