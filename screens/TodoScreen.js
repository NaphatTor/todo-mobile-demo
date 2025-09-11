import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const STORAGE_KEY = "@todos_v1";


export default function TodoScreen() {
  const navigation = useNavigation();

  const [todos, setTodos] = useState([]); // [{id,title,done,createdAt}]
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done

  const inputRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  //first time
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTodos(JSON.parse(raw));
      } catch (e) {
        console.warn("load error", e);
      }
    })();
  }, []);

  //save
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch((e) =>
      console.warn("save error", e)
    );
  }, [todos]);

  const addTodo = () => {
    const title = text.trim();
    if (!title) return;
    const newTodo = {
      id: Date.now().toString(),
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setText("");
  };

  const toggleTodo = (id) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () => {
    const hasDone = todos.some(t => t.done);
    if (!hasDone) return;

    if (Platform.OS === "web") {
      //web
      if (window.confirm("Clear completed? Remove all done tasks.")) {
        setTodos(prev => prev.filter(t => !t.done));
      }
      return;
    }

    //iOS/Android
    Alert.alert("Clear completed?", "Remove all done tasks.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => setTodos(prev => prev.filter(t => !t.done)),
      },
    ]);
  };

  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const FilterTab = ({ value, label }) => (
    <TouchableOpacity
      onPress={() => setFilter(value)}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        marginRight: 8,
        opacity: filter === value ? 1 : 0.6,
      }}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  );

  const TodoItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
      }}
    >
      <TouchableOpacity
        onPress={() => toggleTodo(item.id)}
        style={{
          width: 22,
          height: 22,
          marginRight: 12,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.done ? <Text>✓</Text> : null}
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={{ textDecorationLine: item.done ? "line-through" : "none" }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, opacity: 0.6 }}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity onPress={() => deleteTodo(item.id)}>
        <Text>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
  <SafeAreaView style={{ flex: 1 }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // ✅ offset ปรับตาม header
    >
      {/* Header + About */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Todo List</Text>
          <Text style={{ opacity: 0.7 }}>Organize your tasks, stay productive every day</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("About")}>
          <Text style={{ color: "blue" }}>About</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8 }}>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Add a task…"
          returnKeyType="done"
          blurOnSubmit={false}
          autoCapitalize="none"
          autoCorrect={false}
          //onSubmitEditing={addTodo} // มือถือ
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Enter") addTodo(); // Web
          }}
          style={{
            flex: 1,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
        <TouchableOpacity
          onPress={addTodo}
          style={{
            paddingHorizontal: 16,
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: 12,
          }}
        >
          <Text>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filters + Clear */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          marginTop: 8,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <FilterTab value="all"    label={`All (${todos.length})`} />
          <FilterTab value="active" label={`Active (${todos.filter(t => !t.done).length})`} />
          <FilterTab value="done"   label={`Done (${todos.filter(t => t.done).length})`} />
        </View>

        <TouchableOpacity onPress={clearDone}>
          <Text>Clear done</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={TodoItem}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        style={{ flex: 1, marginTop: 4 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text>No tasks yet</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  </SafeAreaView>
);

}
